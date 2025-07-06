<template>
    <view class="content">
        <view class="text-area  b-1px b-solid b-color-red flex w750 box-border">
            <view class="title">{{ title }}</view>
        </view>

        {{userStore.token}}

        <view @click="handleClick">获取接口</view>

        <!-- 其他页面内容 -->
        <co-tabbar :activeColor="'#FF5722'" :inactiveColor="'#999999'" :safeAreaInsetBottom="true" />
    </view>
</template>

<script setup lang="ts">
    import { useUserStore } from '@/store'
    const userStore = useUserStore()

    const title = ref('Hello')

    const page = ref(0)

    const handleClick = () => {
        page.value += 1
        let url = uni.$urls.common.getArticle
        console.log(uni.$urls.common.getArticle)
        uni.$doHttp.get(url, {
            current: page.value,
            size: 1 * 2,
            status: true
        }, {
            cache: 1 * 30,
        }).then((res) => {
            console.log('res-----', res)
        }).catch((err) => {
            console.log(err)
        })

    }

    onMounted(() => {
        handleClick()
    })
</script>

<style>
    .content {}
</style>