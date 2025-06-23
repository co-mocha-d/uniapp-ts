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


    onMounted(() => {
        let url = uni.$urls.common.getArticle
        console.log(uni.$urls.common.getArticle)
        uni.$doHttp.get(url, {
            current: 1,
            size: 5,
            status: true
        }, {
            cache: 1 * 60,
        }).then((res) => {
            console.log('res-----', res)
        }).catch((err) => {
            console.log(err)
        })
    })


</script>

<style>
    .content {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
    }
</style>