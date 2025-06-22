import { defineStore } from "pinia";

// 需要缓存持久化的数据
const NEED_CACHE = [
    'isLogin',
    'token',
    'userInfo',
    'shopInfo',
    'shopIdKey',
    'wxOpenId',
    'wxUnionid',
    'shopVersion',
    'whd_im',
    'im_is_login'
]

const useUserStore = defineStore("user", {
    state: () => ({
        // 当前用户是否时登录
        isLogin: false,
        // 用户token数据
        token: 'token',
        // 用户信息、配置信息
        userInfo: {},
        // 当前访问的店铺信息
        shopInfo: {},
        // 当前访问店铺的门店ID信息
        shopIdKey: '',
        // 是否登录页面显示中
        isLoginShowing: false,
        // 微信openId
        wxOpenId: '',
        // 微信unionid
        wxUnionid: '',
        // 当前店铺版本号（用作店铺装修预览展示）
        shopVersion: '',
        // 主题色
        mainColor: '#FF3C26',
        // 当前店铺样式主题颜色
        shopStyleColor: '#FF3C26',
        // 当前店铺装修的样式数据
        shopStyle: {},
        // 当前请求次数
        requestNum: 0,
        // 用户微店im
        whd_im: {},
        // 是否登录im
        im_is_login: false,
        // 当前网络状态
        networkStatus: true
    }),
    actions: {
        // 设置用户当前的登录状态
        setLogin (val = false) {
            this.isLogin = val
        },
        // 设置Token
        setToken (token = '') {
            this.token = token
        },
        // 设置用户基本信息
        setUserInfo (userInfo = {}) {
            this.userInfo = userInfo
            this.imUpdateInfo()
        },
        // 设置存储当前门店的ID信息
        setShopIdStr (shopIdKey = '') {
            this.shopIdKey = shopIdKey
        },
        // 设置当前访问店铺的信息
        setShopInfo (shopInfo = {}) {
            this.shopInfo = shopInfo
        },
        // 设置微信openId
        setWxOpenId (wxOpenId = '') {
            this.wxOpenId = wxOpenId
        },
        // 设置微信unionid
        setWxUnionid (wxUnionid = '') {
            this.wxUnionid = wxUnionid
        },
        // 设置当前店铺装修版本号
        setShopVersion (shopVersion = '') {
            this.shopVersion = shopVersion
        },
        // 设置程序主题色
        setMain (color = '#FF3C26') {
            this.mainColor = color
        },
        // 设置当前店铺装修的样式
        setShopStyle (shopStyle = {}) {
            this.shopStyle = shopStyle
            // 设置装修主题色
            this.shopStyleColor = shopStyle?.theme_color || '#FF3C26'
        },
        // 设置当前网络状态
        setNetworkStatus (status) {
            this.networkStatus = status
        },
        // 获取用户信息
        getUserInfo () {
            if (!this.isLogin) return;
            uni.$doHttp
                .post(uni.$urls.user.getUserInfo, {}, { load: false })
                .then((res) => {
                    this.setUserInfo(res)
                    this.getShopInfo()
                })
        },
        // 登录成功
        loginSuccess (res) {
            this.setLogin(true)
            this.setToken(res?.token)
            useShopCartStore()?.getShopCartNum()
            this.getUserInfo()
            uni.removeStorageSync('LAST_SELED_ADDRESS')
            this.imInit()
        },
        // 退出登录
        doLoginOut () {
            this.setLogin(false)
            this.setToken()
            this.setUserInfo()

            // 重置店铺的关注状态
            let nowShopInfo = uni.$u.deepClone(this.shopInfo)
            nowShopInfo.is_favorites = 0
            this.setShopInfo(nowShopInfo)
            // 清空购物车
            useShopCartStore()?.getShopCartNum()
            this.imLogout()
        },
        // 设置是否登录页面显示中
        setLoginShowing (isShowing = false) {
            this.isLoginShowing = isShowing
            console.log(`设置登录页面显示中状态为：${isShowing}`)
        },
        setRequestNum (num) {
            this.requestNum = num
        },
        changeRequestNum (mark = '') {
            if (mark == 'add') {
                this.requestNum++
            }
            if (mark == 'minus') {
                this.requestNum--
            }
        },
        // 获取微信小程序openId
        getWxOpenId () {
            return new Promise((resolve, reject) => {
                let that = this;
                // 如果存在openId直接resolve
                if (that.wxOpenId) {
                    console.log(`从缓存中获取openId成功`)
                    resolve(true)
                    return
                }
                uni.login({
                    provider: 'weixin',
                    success (res) {
                        // code获取成功
                        if (res?.errMsg === 'login:ok') {
                            // 通过code去服务器拿openid和unionid
                            let url = uni.$urls.user.getWxOpenId
                            let postData = {
                                code: res.code
                            };
                            uni.$doHttp
                                .post(url, postData, { load: false })
                                .then((result) => {
                                    console.log(`获取微信openId成功`)
                                    // 保存微信小程序用户的openid和unionid
                                    that.setWxOpenId(result?.openid)
                                    that.setWxUnionid(result?.unionid)
                                    resolve(true)
                                }).catch((err) => {
                                    console.log(`获取微信openId失败`, err)
                                    reject('获取微信openId失败')
                                })
                        } else {
                            console.log(`获取微信openId失败x`)
                            reject('获取微信openId失败')
                        }
                    },
                    fail (err) {
                        console.log(`获取微信openId失败`, err)
                        reject('获取微信openId失败')
                    },
                })
            })
        },
        //im初始化
        imInit (whd_im) {
            return new Promise((resolve, reject) => {
                if (!this.isLogin) {
                    reject(false)
                    return;
                }
                let url = uni.$urls.im.getSign
                uni.$doHttp
                    .post(url, {}, { load: false })
                    .then((res) => {
                        this.whd_im = {
                            user_sig: res.im_user_id,
                            sign: res.im_sign
                        }
                        uni.$tim.login({
                            userID: res.im_user_id,
                            userSig: res.im_sign
                        }).then(user => {
                            this.im_is_login = true
                            // 登录成功
                            console.log('登录成功1', user);
                            this.imUpdateInfo()
                            resolve(true)

                        }).catch(error => {
                            // 登录失败
                            this.im_is_login = false
                            console.error('登录失败1', error);

                            reject(false)
                        });

                    }).catch((err) => {
                        reject(false)
                    })

            })
        },
        // 退出IM
        imLogout () {
            return new Promise((resolve, reject) => {
                if (this.im_is_login) {
                    uni.removeTabBarBadge({
                        index: 2
                    })
                    let promise = uni.$tim.logout();
                    promise.then((imResponse) => {
                        this.im_is_login = false
                        resolve(imResponse)
                    }).catch(function (imError) {
                        console.warn('logout error:', imError);
                        reject(imError)
                    });
                    // uni.$getTotalUnreadCount()		
                }
            })
        },
        // IM修改用户资料
        imUpdateInfo () {
            if (this.im_is_login) {
                let info = {}
                if (this.userInfo.user_name) {
                    info.nick = this.userInfo.user_name
                }

                if (this.userInfo.user_avatar && this.userInfo.user_avatar.original_img) {
                    info.avatar = this.userInfo.user_avatar.original_img
                }

                if (Object.getOwnPropertyNames(info).length > 0) {
                    // 修改个人标配资料
                    setTimeout(() => {
                        let promise = uni.$tim.updateMyProfile(info);
                        promise.then(function (imResponse) {
                            console.log('新资料成功===', imResponse.data); // 更新资料成功
                        }).catch(function (imError) {
                            console.warn('updateMyProfile error:', imError); // 更新资料失败的相关信息
                        });
                    }, 1000)
                }
            }
        }
    },
    // 配置持久化
    persist: {
        // 调整为兼容多端的API
        storage: {
            setItem (key, value) {
                uni.setStorageSync(key, encodeURIComponent(JSON.stringify(value)))
            },
            getItem (key) {
                let localString = decodeURIComponent(uni.getStorageSync(key) || '')
                return localString ? JSON.parse(localString) : null
            },
        },
        paths: NEED_CACHE // 指定持久化的数据，不写默认持久化整个state（小程序不生效，还是会缓存所有数据）
    },
})

export default useUserStore