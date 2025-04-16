import { createSSRApp } from "vue";
import App from "./App.vue";
// pinia状态管理
import { createPinia } from "pinia";
// pinia状态管理持久化插件
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate';
import 'virtual:uno.css';


export function createApp() {
    const app = createSSRApp(App);
    const pinia = createPinia();
    pinia.use(piniaPluginPersistedstate)
    app.use(pinia);
    return {
        app,
        pinia
    };
}