// 全局配置项（常量静态数据）
export default {
    // 图片存在服务器的地址
    IMAGE_PATH: "",
    // 状态高度（常用于自定义导航栏时，获取）
    navHeight: `calc(${uni.getSystemInfoSync().statusBarHeight}px + 44px)`,
    // 状态栏高度（纯数字，不带单位）
    navHeightNum: Number(uni.getSystemInfoSync().statusBarHeight) + 44,
    // 底部tabbar高度
    tabbarHeight: uni.getSystemInfoSync().screenHeight - uni.getSystemInfoSync().windowHeight - uni.getSystemInfoSync().statusBarHeight - 44, // 44 是导航栏高度（不含状态栏）,
}