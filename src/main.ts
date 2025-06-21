import { createSSRApp } from "vue";
import App from "./App.vue";
// pinia状态管理
import { createPinia } from "pinia";
// pinia状态管理持久化插件
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate';
// import 'virtual:uno.css';
// main.js，注意要在use方法之后执行
import uviewPlus, { setConfig } from '@/uni_modules/uview-plus'

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
    return {
        app,
        pinia
    };
}