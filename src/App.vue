<script setup lang="ts">
    import { onLaunch, onShow, onHide } from "@dcloudio/uni-app";
    onLaunch(() => {
        console.log("App Launch");

        // uni.hideTabBar();
    });
    onShow(() => {
        console.log("App Show");
    });
    onHide(() => {
        console.log("App Hide");
    });
</script>
<style lang="scss">
    /* uview组件库样式 */
    @import "@/uni_modules/uview-plus/index.scss";
</style>