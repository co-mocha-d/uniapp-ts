import request from "./request/index";
import { useUserStore } from '@/store/index' // 导入pinia状态管理配置
// import {
// 	DecryptAES,
// 	EncryptAES,
// 	KEY,
// 	IVS,
// 	DecryptAESKey
// } from './encrypt.js' // 加解密
// import {
// 	toLogin
// } from "../common/tools";

// 全局配置的请求域名
const baseUrl = process.env.VITE_BASE_API || import.meta.env.VITE_BASE_API; // 接口地址域名
/**
 * 清除字符串的空格
 * @param {String} str 传入的字符串
 * @returns
 */
function trim (str) {
    if (str == null) {
        str = "";
    }
    return str.replace(/(^\s*)|(\s*$)/g, "");
}

// 可以new多个request来支持多个域名请求
let $http = new request({
    // 接口请求地址
    baseUrl: baseUrl,
    // 设置请求头（如果使用报错跨域问题，可能是content-type请求类型和后台那边设置的不一致）
    header: {
        'content-type': 'application/x-www-form-urlencoded'
    },
    // 请求超时时间（默认16000）
    timeout: 16000,
    // 默认配置（可不写）
    config: {
        // 是否显示加载动画
        load: true,
        // 是否使用数据工厂
        isFactory: true,
        // 加载动画提示文字
        loadingText: '加载中',
    }
});

//请求开始拦截器
$http.requestStart = function (options) {
    console.log('请求开始拦截器', options)

    const userStore = useUserStore() // pinia用户模块数据对象
    if (options.load) {
        if (userStore?.requestNum <= 0) {
            //打开加载动画
            uni.showLoading({
                title: options.loadingText,
                mask: true
            });
        }
        userStore?.changeRequestNum('add')
    }

    //请求前加入token
    let myToken = userStore?.token || ''
    myToken = myToken.replace(/\"/g, "");
    options.header['token'] = myToken;
    options.header['X-Requested-With'] = 'XMLHttpRequest';
    // 正式服或者APP跳转过来的才数据加密
    // if (import.meta.env.MODE != "development" || userStore?.enterFrom == 'app') {
    //     console.log(`🫣[ 请求地址 ] %c${options?.url}`, 'background: #999; padding:5px 8px; border-radius: 5px;')
    //     console.log('🫣[ 请求参数 ]', options.data)

    //     // 传递IVS 和 KEY
    //     options.header["IVS"] = EncryptAES(IVS);
    //     options.header["KEY"] = EncryptAES(KEY);
    //     // data数据加密
    //     let dataEncryption = {}
    //     if (typeof options.data !== 'undefined' && Object.keys(options.data).length > 0) {
    //         // 对象存在
    //         dataEncryption = encodeURIComponent(EncryptAES(options.data))
    //     } else {
    //         // 对象不存在
    //         dataEncryption = encodeURIComponent(EncryptAES({
    //             v: '3'
    //         }))
    //     }
    //     options.data = 'datas=' + dataEncryption
    // }
    return options; // return false 表示请求拦截，不会继续请求
}

//请求结束
$http.requestEnd = function (options) {
    const userStore = useUserStore() // pinia用户模块数据对象
    //判断当前接口是否需要加载动画
    if (options.load) {
        userStore?.changeRequestNum('minus');
        if (userStore?.requestNum <= 0) {
            uni.hideLoading();
        }
    }
}
//所有接口数据处理（可在接口里设置不调用此方法）
//此方法需要开发者根据各自的接口返回类型修改，以下只是模板
$http.dataFactory = async function (res) {
    console.log('res=========', res)

    const userStore = useUserStore() // pinia用户模块数据对象
    // 正式服或者APP跳转过来的才解密
    // if (import.meta.env.MODE != "development" || userStore?.enterFrom == 'app') {
    //     let IVSThis, KEYThis;
    //     //通过解密获取后端返回在 header 的IV
    //     IVSThis = DecryptAESKey(res.response.header.Iv)
    //     //通过解密获取后端返回在 header 的key
    //     KEYThis = DecryptAESKey(res.response.header.Key)
    //     //#ifdef H5
    //     //通过解密获取后端返回在 header 的IV
    //     IVSThis = DecryptAESKey(res.response.header.iv)
    //     //通过解密获取后端返回在 header 的key
    //     KEYThis = DecryptAESKey(res.response.header.key)
    //     //#endif
    //     // 解密数据
    //     res.response.data = DecryptAES(trim(res.response.data.datas), IVSThis, KEYThis)
    // }
    if (res.response.statusCode && res.response.statusCode == 200) {
        let httpData = res.response.data;
        if (typeof (httpData) == "string") {
            httpData = JSON.parse(httpData);
        }
        //判断数据是否请求成功
        if (httpData.success || httpData.status == 200) {
            // 返回正确的结果(then接受数据)
            console.log(`🤪[ 请求地址 ] %c${res?.url}`, 'background: green; padding:5px 8px; border-radius: 5px;')
            console.log('🤪[ 返回结果 ]', httpData.data)
            return Promise.resolve(httpData.data);
        } else if (httpData.status == "999") {
            // 登录失效 重新登录
            await gotoLogin().then(() => { })
            // 返回错误的结果(catch接受数据)
            return Promise.reject({
                statusCode: 0,
                errMsg: httpData.message
            });
        } else { //其他错误提示
            console.log(`请求错误====`, httpData)
            // 返回错误的结果(catch接受数据)
            return Promise.reject({
                statusCode: 0,
                data: httpData?.data,
                errMsg: httpData.message
            });
        }
    } else {
        // 返回错误的结果(catch接受数据)
        return Promise.reject({
            statusCode: res.response.statusCode,
            errMsg: "数据工厂验证不通过"
        });
    }
};
// 错误回调
$http.requestError = function (e, data) {
    if (e.statusCode === 0) {
        setTimeout(() => {
            uni.$toast(e?.errMsg)
        }, 100)
        throw e;
    } else {
        setTimeout(() => {
            uni.$toast("网络错误 请检查一下网络")
        }, 100)
    }
}

//token过期，退出登录
function gotoLogin () {
    return new Promise((resolve, rejict) => {
        const userStore = useUserStore() // pinia用户模块数据对象
        userStore?.doLoginOut()
        uni.$u.throttle(
            // toLogin(),
            500)

        // 退出登录操作，清空数据，跳转至登录页面
        resolve()
    })
}
export default $http;
