import {
    mergeConfig,
    dispatchRequest,
    jsonpRequest,
    getType,
    deepCompare
} from "./utils.js";
import $cache from './cache.js'

/**
 * 对象深拷贝
 */
export function deepClone (obj) {
    let objClone = Array.isArray(obj) ? [] : {}
    if (obj && typeof obj === 'object') {
        for (let key in obj) {
            if (obj[key] && typeof obj[key] === 'object') {
                objClone[key] = deepClone(obj[key])
            } else {
                objClone[key] = obj[key]
            }
        }
    }
    return objClone
}

const CACHE_LIVETIME = 0 // 缓存时间


export default class request {
    constructor(options) {
        //请求公共地址
        this.baseUrl = options.baseUrl || "";
        //公共文件上传请求地址
        this.fileUrl = options.fileUrl || "";
        // 超时时间
        this.timeout = options.timeout || 6000;
        // 服务器上传图片默认url
        this.defaultUploadUrl = options.defaultUploadUrl || "";
        //默认请求头
        this.header = options.header || {};
        //默认配置
        this.config = options.config || {
            load: true,
            isFactory: true,
            resend: 0
        };
    }
    //post请求
    post (url = '', data = {}, options = {}) {
        return this.request({
            method: "POST",
            data: data,
            url: url,
            ...options
        });
    }

    //get请求
    get (url = '', query = {}, options = {}) {
        return this.request({
            method: "GET",
            data: query,
            url: url,
            ...options
        });
    }

    //put请求
    put (url = '', data = {}, options = {}) {
        return this.request({
            method: "PUT",
            data: data,
            url: url,
            ...options
        });
    }

    //delete请求
    delete (url = '', data = {}, options = {}) {
        return this.request({
            method: "DELETE",
            data: data,
            url: url,
            ...options
        });
    }
    //jsonp请求(只限于H5使用)
    jsonp (url = '', data = {}, options = {}) {
        return this.request({
            method: "JSONP",
            data: data,
            url: url,
            ...options
        });
    }
    //接口请求方法
    async request (data) {
        // 请求数据
        let requestInfo,
            // 是否运行过请求开始钩子
            runRequestStart = false;
        try {
            if (!data.url) {
                throw {
                    errMsg: "【request】缺失数据url",
                    statusCode: 0
                }
            }
            // 数据合并
            requestInfo = mergeConfig(this, data);
            // 代表之前运行到这里
            runRequestStart = true;
            //请求前回调
            if (this.requestStart) {
                let requestStart = this.requestStart(requestInfo);
                if (typeof requestStart == "object") {
                    let changekeys = ["data", "header", "load", "isFactory"];
                    changekeys.forEach(key => {
                        requestInfo[key] = requestStart[key];
                    });
                } else {
                    throw {
                        errMsg: "【request】请求开始拦截器未通过",
                        statusCode: 0,
                        data: requestInfo.data,
                        method: requestInfo.method,
                        header: requestInfo.header,
                        url: requestInfo.url,
                    }
                }
            }



            const { cache = false, refreshCache = false, url, data: params } = data

            /* 在此处拦截 优先读取缓存**/
            let cacheUrl = url
            let cacheParams = deepClone(params)
            // cacheParams = qs.stringify({ encrypt_data: EncryptAES(cacheParams) }, { arrayFormat: 'indices', })

            // 区分大小写的排序（基于 ASCII）
            const sortedKeys = Object.keys(cacheParams).sort((a, b) =>
                a.localeCompare(b, undefined, { sensitivity: 'variant' })
            );

            cacheParams = Object.fromEntries(sortedKeys.map(key => [key, cacheParams[key]]));

            cacheParams =  qs.stringify({ encrypt_data: EncryptAES(cacheParams) }, { arrayFormat: 'indices', })

            if (!refreshCache && (cache || getType(cache) === 'number')) {
                let cacheData = $cache.get(cacheUrl, cacheParams) || []

                let cacheList = $cache.get('co_cache_url').data || []
                let newCacheList = cacheList.filter(v => v !== cacheUrl)
                newCacheList.push(cacheUrl)
                $cache.set('co_cache_url', newCacheList)
                if (!cacheData.isTimeout && cacheData.data && getType(cacheData.data) === 'array') {
                    let targetData = cacheData.data.filter(v => {
                        return v.params && deepCompare(v.params, cacheParams)
                    })

                    if (targetData && targetData.length > 0) {
                        let resultData = {}
                        // if (typeof targetData[0]['data'] === 'string') {
                        //     let dataAES = DecryptAES(targetData[0]['data'].trim())
                        //     resultData = JSON.parse(JSON.stringify(dataAES))
                        // } else {
                        resultData = targetData[0]['data']
                        // }

                        console.log(`%c [${cacheUrl}请求参数]`, 'font-size:13px; background:#fff; color:#3498db;', params)
                        console.log(`%c [${cacheUrl}缓存数据]`, 'font-size:13px; background:#fff; color:#3498db;', resultData)
                        // resolve(resultData || [])
                        // return
                        return Promise.resolve(resultData);
                    }
                }
            }





            let requestResult = {};
            if (requestInfo.method == "JSONP") {
                requestResult = await jsonpRequest(requestInfo);
            } else {
                requestResult = await dispatchRequest(requestInfo);
            }

            //是否用外部的数据处理方法
            if (requestInfo.isFactory && this.dataFactory) {
                //数据处理
                let result = await this.dataFactory({
                    ...requestInfo,
                    response: requestResult
                });

                if (cache || getType(cache) === 'number') {

                    if (refreshCache) {
                        $cache.remove(cacheUrl)
                    }
                    // 缓存
                    let cacheData = $cache.get(cacheUrl, cacheParams).data || []
                    let cacheIndex = cacheData.findIndex(v => {
                        return v.params && deepCompare(v.params, cacheParams)
                    })

                    let createTime = Date.now()
                    if (cacheData && getType(cacheData) == 'array') {
                        if (cacheIndex !== -1) {
                            cacheData[cacheIndex].data = result
                            cacheData[cacheIndex].createTime = createTime
                        } else {
                            cacheData.push({
                                params: cacheParams,
                                data: result || [],
                                createTime: createTime
                            })
                        }

                        $cache.set(cacheUrl, cacheData, getType(cache) === 'number' ? cache : CACHE_LIVETIME)
                    } else {
                        cacheData = [{
                            params: cacheParams,
                            data: result || [],
                            createTime: createTime
                        }]
                        $cache.set(cacheUrl, cacheData, getType(cache) === 'number' ? cache : CACHE_LIVETIME)
                    }
                }



                return Promise.resolve(result);
            } else {
                console.log('requestResult===', requestResult)
                return Promise.resolve(requestResult);
            }
        } catch (err) {
            this.requestError && this.requestError(err, data);
            return Promise.reject(err);
        } finally {
            // 如果请求开始未运行到，请求结束也不运行
            if (runRequestStart) {
                this.requestEnd && this.requestEnd(requestInfo);
            }
        }
    }
}
