<template>
    <view class="content">
        <view>home</view>
        <view class="scroll-wrap">
            <scroll-view scroll-y style="height: 100%;">
                <view style="height: 300rpx;">123456</view>
                <view style="height: 300rpx;">123456</view>
                <view style="height: 300rpx;">123456</view>
                <view style="height: 300rpx;">123456</view>
                <view>底部</view>

            </scroll-view>
        </view>
    </view>
</template>

<script setup lang="ts">
    import { useUserStore } from '@/store'
    const userStore = useUserStore()

    const currentComponent = ref(null)
    const title = ref('Hello')
</script>

<style lang="scss" scoped>
    .content {
        display: flex;
        flex-direction: column;
        height: 100%;

        .scroll-wrap {
            flex: 1;
            overflow: hidden;
        }
    }
</style>