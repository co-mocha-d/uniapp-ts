import { createSSRApp } from "vue";
import App from "./App.vue";
// pinia状态管理
import { createPinia } from "pinia";
// pinia状态管理持久化插件
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate';
// import 'virtual:uno.css';
// main.js，注意要在use方法之后执行
import uviewPlus, { setConfig } from '@/uni_modules/uview-plus'
// 公共网络请求方法
import doHttp from "@/network/requestConfig";
// API地址
import urls from "@/network/apiUrl"

export function createApp() {
    const app = createSSRApp(App);
    const pinia = createPinia();
    pinia.use(piniaPluginPersistedstate)
    app.use(pinia).use(uviewPlus, () => {
        return {
            options: {
                // 修改$u.config对象的属性
                config: {
                    // 修改默认单位为rpx，相当于执行 uni.$u.config.unit = 'rpx'
                    unit: 'rpx'
                }
            }
        }
    });

    // 全局挂载（可在template中直接使用：如$tools.numberToString(12548)）


    // 全局挂载参数、方法在uni上
    uni.$urls = urls;
    uni.$doHttp = doHttp;

    return {
        app,
        pinia
    };
}