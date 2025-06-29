import {
    useUserStore, useStatisticsStore
} from '@/store/index'

let baseUrl = process.env.VITE_BASE_API || import.meta.env.VITE_BASE_API; // 接口地址域名

// 是否开启开发调试
if (uni.getStorageSync('IS_OPEN_DEV') == 1) {
    if (uni.getStorageSync('IS_TEST_SERVER') == 1) {
        console.log('调试模式---测试服')
        baseUrl = 'http://oatest.tfxk.org'
    } else {
        console.log('调试模式---正式服')
        baseUrl = 'https://oa.tfxk.com'
    }
}


export default {
    /**
     * 全局前往去登录页面
     */
    toLogin () {
        // 已登录拦截
        let userStore = useUserStore()
        console.log(`全局前往登录`, userStore?.isLoginShowing)
        if (userStore?.isLogin) {
            console.log('拦截提示：检测到当前状态为已登录！')
            return
        }

        // 登录页面显示中拦截
        if (userStore?.isLoginShowing) {
            console.log('拦截提示：登录页面显示中，请勿重复调用！')
            return
        }

        // #ifdef MP-WEIXIN
        // 微信小程序登录前：再次获取openid是否存在。不存在就再获取一次
        userStore?.getWxOpenId().then((res) => {
            // 设置登录页面显示中状态
            userStore?.setLoginShowing(true)
            uni.reLaunch({
                url: `/pagesUser/login/index`
            })
        })
        // #endif

        // #ifdef H5
        // H5平台直接跳转登录页面
        // 设置登录页面显示中状态
        userStore?.setLoginShowing(true)
        uni.reLaunch({
            url: `/pagesUser/login/index`
        })
        // #endif
    },
    /**
     * 返回上一页或跳转首页
     * @param {String} url 跳转地址
     * @param {Boolean} useSwitchTab 是否使用switchTab跳转
     */
    handleBack (url = '/pages/home/index?tab=0', useSwitchTab = true) {
        const pages = getCurrentPages();
        if (pages.length > 1) {
            uni.navigateBack({ delta: 1 });
        } else {
            if (useSwitchTab) {
                uni.reLaunch({ url: url });
                //   uni.switchTab({ url: url });
            } else {
                uni.reLaunch({ url: url });
            }
        }
    },

    // 数字转换(转换为>10000为w)
    numberToString (num = 0) {
        let myNumber = num < 1 ? parseFloat(num) : parseInt(num)
        return myNumber > 9999 ? `${parseInt((myNumber / 10000) * 10) / 10}万` : (myNumber <= 0 || !myNumber ? '0' :
            myNumber);
    },
    /**
     * @description 预览图片
     * @param {Array} imgs 图片地址数组
     * @param {String} current 当前显示图片的链接/索引值
     */
    doPreviewImg (imgs = [], current = '') {
        if (imgs?.length <= 0) return;

        uni.previewImage({
            urls: imgs,
            current: current || 0,
        })
    },
    /**
     * 文本复制
     * @param {String} content 文本内容
     */
    toCopyText (content = '', contentDesc = '', showToast = true) {
        if (!content) return;
        uni.setClipboardData({
            // 要被复制的内容
            data: content,
            showToast,
            success: () => {
                showToast && uni.$toast(`成功复制${contentDesc || ''}`);
            }
        });
    },
    // 压缩图片函数
    compressImage (imageFile, targetSize) {
        return new Promise((resolve, reject) => {
            // #ifdef H5
            // 若为H5，则无需压缩直接返回(H5暂不支持compressImage方法)
            resolve(imageFile);
            return
        });
    },
    // 上传文件
    uploadFile (filePath, options = {}) {
        return new Promise((resolve, reject) => {
            if (options?.loading) {
                uni.showLoading({
                    title: `上传中`
                })
            }
            // 目标文件大小为1兆字节
            const targetSize = 1 * 1024 * 1024;
            // 图片压缩处理
            this.compressImage(filePath, targetSize)
                .then((compressedFilePath) => {
                    // 开始上传图片
                    uni.uploadFile({
                        url: `${baseUrl}${uni.$urls.common.uploadFile}`,
                        filePath: compressedFilePath,
                        name: 'file',

                        success: (res) => {
                            setTimeout(() => {
                                if (res?.statusCode == 200) {
                                    let resData = JSON.parse(res?.data || '{}')
                                    resolve(resData?.data || []);
                                }
                            }, 200);
                        },
                        complete: (res) => {
                            if (options?.loading) {
                                uni.hideLoading()
                            }
                        },
                        fail: (err) => {
                            console.log('图片上传失败', JSON.stringify(err))
                            uni.$toast('图片上传失败')
                        }
                    });
                })
                .catch((err) => {
                    console.log('压缩图片出错：', err);
                    uni.hideLoading()
                });
        });
    },
    /**
     * @description 前往webview页面
     * @param {String} url 第三方地址链接
     * @param {String} title 标题
     */
    gotoWebview (url = '', title = '') {
        if (!url) {
            uni.$toast('url地址不能为空')
            return
        }
        uni.navigateTo({
            url: `/pagesCommon/webView/index?url=${encodeURIComponent(url)}&title=${title}`
        })
    },

    /**
     * 跳转到富文本页面
     * @param content 富文本内容
     * @param contentObj 富文本相关数据 { type：类型, id：对象ID, title：标题, content：显示的富文本类型 }
     */
    gotoRichText (contentObj) {
        uni.navigateTo({
            url: `/pagesCommon/showRichText/index?type=${contentObj?.type || ''}&id=${contentObj?.id || ''}&title=${contentObj?.title || ''}&content=${contentObj?.content || ''}`
        });
    },

    /**
     * 获取oss图片完整链接
     * @param {String} imageName 图片名
     */
    getOSSImageUrl (imageName) {
        let imgUrl = `${uni.$constant.IMAGE_PATH}${imageName}`
        return imgUrl
    },

    /**
     * 获取本地图片完整链接
     * @param {String} imageName 图片名
     */
    getStaticImageUrl (imageName) {
        let imgUrl = `/static/img/${imageName}`
        return imgUrl
    },

    // 点击广告跳转
    jumpAdvUrl (linkUrl) {
        if (linkUrl?.startsWith('http')) {
            // 打开web地址
            this.gotoWebview(linkUrl);
        } else if (linkUrl?.startsWith('/pages')) {
            // 跳转内部路由
            uni.navigateTo({
                url: linkUrl
            })
        } else {
            console.log('暂不兼容：' + linkUrl)
        }
    },

    // 拨打电话
    callPhone (phoneNum) {
        if (phoneNum.length > 0) {
            uni.makePhoneCall({
                phoneNumber: phoneNum
            });
        } else {
            console.log("电话号码不能为空!");
        }
    },
    /**
     * 获取生成吸顶样式（top值）
     * @param   iscCustom  Bollean 页面中是否是自定义导航栏
     */
    getStickyTop (iscCustom = false) {
        let userStore = useUserStore()
        let top = 0
        // #ifdef H5
        top = `calc(${userStore?.statusBarHeight}px + 44px)`
        // #endif
        // #ifdef MP-WEIXIN
        if (iscCustom) {
            top = `calc(${userStore?.statusBarHeight}px + 44px)`
        }
        // #endif
        return {
            top: top
        }
    },
    /**
     * 判断底部表彰icon是否需要展示 去点赞图标
     */
    getMyFavor (params) {
        // 获取统计状态管理
        const statisticsStore = useStatisticsStore()
        console.log(uni.$urls.honour);
        let url = uni.$urls.honour.getMyFavor
        uni.$doHttp
            .post(url, { date: params?.date || '' }, {
                load: false
            })
            .then((res) => {
                const status = res?.is_show_favor_icon == 1
                statisticsStore.setIsShowFavorIcon(status)
            })
    }
}


