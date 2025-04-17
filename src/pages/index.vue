<template>
    <view class="page-container">
        <!-- 状态栏占位 -->
        <up-navbar title="个人中心" :autoBack="false" placeholder>
        </up-navbar>

        <view class="page-warp">

            <Home v-if="currentName == 'home'"></Home>
            <User v-if="currentName == 'user'"></User>

        </view>
        <!-- <view style="height: 70rpx;"> -->
        <!-- 其他页面内容 -->
        <co-tabbar v-model:name="currentName" :activeColor="'#FF5722'" :inactiveColor="'#999999'"
            :safeAreaInsetBottom="true" />
        <!-- </view> -->

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
    .page-container {
        display: flex;
        flex-direction: column;
        height: 100vh;
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