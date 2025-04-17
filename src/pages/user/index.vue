<template>
    <view class="content">
        <view class="text-area  b-1px b-solid b-color-red flex w750 box-border">
            <view class="title">{{ title }}</view>
        </view>

        {{ title }}
        {{userStore.token}}

        <!-- 其他页面内容 -->
        <co-tabbar :activeColor="'#FF5722'" :inactiveColor="'#999999'" :safeAreaInsetBottom="true" />
    </view>
</template>

<script setup lang="ts">
    import { useUserStore } from '@/store'
    const userStore = useUserStore()

    const title = ref('Hello')


</script>

<style>
    .content {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
    }
</style>