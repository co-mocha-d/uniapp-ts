<template>
    <view class="page-container-default">
        <!-- 状态栏占位 -->
        <up-navbar title="个人中心" :autoBack="false" :fixed="false">
        </up-navbar>

        <view class="page-warp">

            <Home v-if="currentName == 'home'"></Home>
            <User v-if="currentName == 'user'"></User>

        </view>

        <!-- 其他页面内容 -->
        <co-tabbar v-model:name="currentName" :safeAreaInsetBottom="true" />

    </view>
</template>

<script setup lang="ts">
    import Home from '@/pages/home/index';
    import User from '@/pages/user/index';
    import { useUserStore } from '@/store'
    const userStore = useUserStore()
    const title = ref('Hello')

    const currentName = ref('home')
</script>
<style lang="scss" scoped>
    view {
        box-sizing: border-box;
    }

    .page-container-default {
        display: flex;
        flex-direction: column;
        height: 100vh;
        width: 100vw;
        overflow: hidden;


        .page-warp {
            flex: 1;
            overflow: hidden;
        }

    }

    /* .status_bar {
        height: var(--status-bar-height);
      
        width: 100%;
    } */
</style>