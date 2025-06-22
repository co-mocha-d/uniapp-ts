<template>
    <view class="content">
        <view>home</view>
        <view class="scroll-wrap">
            <scroll-view scroll-y style="height: 100%;">
                <co-input placeholder="请输入嘿嘿" :data="['input前面的插槽']" ref="myInputRef" v-model:modelValue="content"
                    @change="inputChange">
                    <template #prefix="{row}">{{row || ''}}{{2312456}}</template>
                </co-input>

                <view @click="clickHandle">点击我</view>
                <view @click="goOther">跳转</view>
                <view>底部</view>

            </scroll-view>
        </view>
    </view>
</template>

<script setup lang="ts">
    import { useUserStore } from '@/store'
    const userStore = useUserStore()

    const myInputRef = ref(null)

    const content = ref('哈哈哈')

    const clickHandle = () => {
        console.log(myInputRef.value)
        myInputRef.value?.onClear()
    }

    const inputChange = (val) => {
        console.log('inputChange', val)
    }

    const goOther = () => {
        uni.navigateTo({
            url: '/pages/pagesOther/index'
        })

    }

    const currentComponent = ref(null)
    const title = ref('Hello')
</script>

<style lang="scss" scoped>
    .content {
        display: flex;
        flex-direction: column;
        height: 100%;
        overflow: hidden;

        .scroll-wrap {
            flex: 1;
            overflow: hidden;
        }
    }
</style>