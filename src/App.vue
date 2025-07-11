<script setup lang="ts">
    import { onLaunch, onShow, onHide } from "@dcloudio/uni-app";
    onLaunch(() => {
        console.log("App Launch");
        // #ifdef APP-PLUS
        // 获取分享服务：解决Android启动时第一次打开三方应用失败问题
        plus.share.getServices();
        // #endif

    });
    onShow(() => {
        console.log("App Show");


        // #ifdef MP
        try {
            const storageInfo = uni.getStorageInfoSync();
            const hd_cache_url = uni.getStorageSync('co_cache_url');
            if (storageInfo.currentSize > 8 * 1024 * 1024) {
                if (hd_cache_url && hd_cache_url.data && Array.isArray(hd_cache_url.data)) {
                    hd_cache_url.data.forEach(e => {
                        uni.removeStorageSync(e)
                    });
                }
            }
        } catch (error) {
        }
        // #endif
    });
    onHide(() => {
        console.log("App Hide");
    });
</script>
<style lang="scss">
    /* uview组件库样式 */
    @import "@/uni_modules/uview-plus/index.scss";
    /*每个页面公共css */
    @import 'css/common.scss';
    /* scss function */
    @import 'css/function.scss';
    /* scss 颜色 */
    @import 'css/colors.scss';
</style>