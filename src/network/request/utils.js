// 获取合并的数据
export const mergeConfig = function (_this, options) {
    //判断url是不是链接
    let urlType = /^(http|https):\/\//.test(options.url);
    let config = Object.assign({
        timeout: _this.timeout
    }, _this.config, options);
    if (options.method == "FILE") {
        config.url = urlType ? options.url : _this.fileUrl + options.url;
    } else {
        config.url = urlType ? options.url : _this.baseUrl + options.url;
    }
    //请求头
    if (options.header) {
        config.header = Object.assign({}, _this.header, options.header);
    } else {
        config.header = Object.assign({}, _this.header);
    }

    return config;
}
// 请求
export const dispatchRequest = function (requestInfo) {
    return new Promise((resolve, reject) => {
        let requestAbort = true;
        let requestData = {
            url: requestInfo.url,
            header: requestInfo.header, //加入请求头
            success: (res) => {
                requestAbort = false;
                resolve(res);
            },
            fail: (err) => {
                requestAbort = false;
                if (err.errMsg == "request:fail abort") {
                    reject({
                        errMsg: "请求超时，请重新尝试",
                        statusCode: 0,
                    });
                } else {
                    // H5 网络异常：{"errMsg":"request:fail"}
                    // App - 苹果网络异常：{"errMsg":"request:fail abort statusCode:-1 似乎已断开与互联网的连接。(-1009)"}
                    // App - 安卓网络异常：{"errMsg":"request:fail abort statusCode:-1 Unable to resolve host"}
                    reject({
                        errMsg: "网络连接失败，请检查网络是否正常",
                        statusCode: 0,
                    });
                }
            }
        };
        //请求类型
        if (requestInfo.method) {
            requestData.method = requestInfo.method;
        }
        if (requestInfo.data) {
            requestData.data = requestInfo.data;
        }
        // #ifdef MP-WEIXIN || MP-ALIPAY
        if (requestInfo.timeout) {
            requestData.timeout = requestInfo.timeout;
        }
        // #endif
        if (requestInfo.dataType) {
            requestData.dataType = requestInfo.dataType;
        }
        // #ifndef APP-PLUS || MP-ALIPAY
        if (requestInfo.responseType) {
            requestData.responseType = requestInfo.responseType;
        }
        // #endif
        // #ifdef H5
        if (requestInfo.withCredentials) {
            requestData.withCredentials = requestInfo.withCredentials;
        }
        // #endif

        console.log('requestData====', requestData)

        // 执行网络请求
        let requestTask = uni.request(requestData);
        setTimeout(() => {
            // 网络请求超时：中断请求
            if (requestAbort) {
                requestTask.abort();
            }
        }, requestInfo.timeout)
    })
}
// jsonp请求
export const jsonpRequest = function (requestInfo) {
    return new Promise((resolve, reject) => {
        let dataStr = '';
        Object.keys(requestInfo.data).forEach(key => {
            dataStr += key + '=' + requestInfo.data[key] + '&';
        });
        //匹配最后一个&并去除
        if (dataStr !== '') {
            dataStr = dataStr.substr(0, dataStr.lastIndexOf('&'));
        }
        requestInfo.url = requestInfo.url + '?' + dataStr;
        let callbackName = "callback" + Math.ceil(Math.random() * 1000000);
        // #ifdef H5
        window[callbackName] = function (data) {
            resolve(data);
        }
        let script = document.createElement("script");
        script.src = requestInfo.url + "&callback=" + callbackName;
        document.head.appendChild(script);
        // 及时删除，防止加载过多的JS
        document.head.removeChild(script);
        // #endif
    });
}



export const deepCompare = (x, y) => {
    // If both x and y are null or undefined and exactly the same 
    if (x === y) {
        return true
    }

    // If they are not strictly equal, they both need to be Objects 
    if (!(x instanceof Object) || !(y instanceof Object)) {
        return false
    }

    //They must have the exact same prototype chain,the closest we can do is
    //test the constructor. 
    if (x.constructor !== y.constructor) {
        return false
    }

    for (var p in x) {
        //Inherited properties were tested using x.constructor === y.constructor
        if (x.hasOwnProperty(p)) {
            // Allows comparing x[ p ] and y[ p ] when set to undefined 
            if (!y.hasOwnProperty(p)) {
                return false
            }

            // If they have the same strict value or identity then they are equal 
            if (x[p] === y[p]) {
                continue
            }

            // Numbers, Strings, Functions, Booleans must be strictly equal 
            if (typeof (x[p]) !== 'object') {
                return false
            }

            // Objects and Arrays must be tested recursively 
            if (!Object.equals(x[p], y[p])) {
                return false
            }
        }
    }

    for (p in y) {
        // allows x[ p ] to be set to undefined 
        if (y.hasOwnProperty(p) && !x.hasOwnProperty(p)) {
            return false
        }
    }
    return true
}





// 导出一个函数getType，用于获取传入参数o的类型
export const getType = (o) => {
    // 使用Object.prototype.toString.call()方法获取参数o的类型
    let s = Object.prototype.toString.call(o);
    // 使用正则表达式匹配类型，并将其转换为小写字母
    return s.match(/\[object (.*?)\]/)[1].toLowerCase();
}
