<!--
* @Description: 类似钉钉头像组件
-->
<template>
    <view class="avatar-wrapper" :style="wrapperStyle">
        <!-- 有头像地址时显示头像图片 -->
        <!-- 懒加载 -->
        <u-lazy-load v-if="isLazy && src && !imageError" :image="src" width="100%" height="100%"
            :borderRadius="round ? '50%' : `${radius}rpx`" @error="handleImageError"
            img-mode="aspectFill"></u-lazy-load>

        <!-- 非懒加载 -->
        <image v-else-if="!isLazy && src && !imageError" :src="src" :style="imageStyle" mode="aspectFill"
            @error="handleImageError">
        </image>

        <!-- 无头像但有用户名时显示文字头像 -->
        <view v-else-if="nameAbbr" class="text-avatar" :borderRadius="round ? '50%' : `${radius}rpx`"
            :style="textAvatarStyle">
            {{ nameAbbr }}
        </view>

        <!-- 默认头像 -->
        <image v-else :src="defaultAvatarUrl" :style="imageStyle" mode="aspectFill"></image>
    </view>
</template>

<script setup>
    import {
        ref,
        computed,
        watch
    } from 'vue'

    const props = defineProps({
        // 头像图片地址
        src: {
            type: String,
            default: ''
        },
        // 用户名称
        name: {
            type: String,
            default: ''
        },
        // 头像大小，单位rpx
        size: {
            type: [Number, String],
            default: 80
        },
        // 圆角大小，单位rpx
        radius: {
            type: [Number, String],
            default: 0
        },
        // 是否显示为圆形
        round: {
            type: Boolean,
            default: true
        },
        // 是否懒加载
        isLazy: {
            type: Boolean,
            default: true
        }
    })

    const imageError = ref(false)

    // 监听src变化，重置错误状态
    watch(() => props.src, (newVal) => {
        if (newVal) {
            imageError.value = false
        }
    })

    // 默认头像地址
    const defaultAvatarUrl = computed(() => {
        return uni.$tools.getOSSImageUrl('default_avatar.png')
    })

    // 获取用户名缩写（最后两个字）
    const nameAbbr = computed(() => {
        if (!props.name) return ''
        return props.name.slice(-2)
    })

    // 包装器样式
    const wrapperStyle = computed(() => {
        const style = {
            width: `${props.size}rpx`,
            height: `${props.size}rpx`,
        }
        // 判断是圆形还是自定义圆角
        if (props.round) {
            style.borderRadius = '50%'
        } else if (props.radius) {
            style.borderRadius = `${props.radius}rpx`
        }
        return style
    })

    // 图片样式
    const imageStyle = computed(() => {
        return {
            width: '100%',
            height: '100%',
            borderRadius: props.round ? '50%' : `${props.radius}rpx`
        }
    })

    // 文字头像样式
    const textAvatarStyle = computed(() => {
        return {
            ...imageStyle.value,
            backgroundColor: '#0089ff', // 蓝底
            color: '#FFFFFF', // 白字
            fontSize: `${props.size * 0.32}rpx`, // 文字大小为容器的0.32倍
        }
    })

    // 图片加载错误处理
    const handleImageError = () => {
        console.log('图片加载失败')
        imageError.value = true
    }
</script>

<style lang="scss" scoped>
    .avatar-wrapper {
        position: relative;
        overflow: hidden;

        .text-avatar {
            width: 100%;
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: normal;
        }
    }
</style>