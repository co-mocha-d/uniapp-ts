<!--
* @Description: 商品骨架屏
-->
<template>
    <view class="skeleton" @touchmove.stop.prevent="clear">
        <view class="goods-warp">
            <view v-for="item in 8" :key="item">
                <view :key="item" class="good-card">
                    <view class="flex" style="margin-bottom: 36rpx;margin-right: 20rpx;">
                        <view class="goods-img  light-to-dark"></view>
                        <view style="padding: 0 10rpx;">
                            <view class="h28 br light-to-dark" style="width: 300rpx;">
                            </view>
                            <view class="h28 br light-to-dark" style="width: 300rpx;margin-top: 20rpx; ">
                            </view>
                            <view class="h28 br dark-to-dark" style="width:100rpx;margin-top: 90rpx">
                            </view>
                        </view>
                    </view>
                </view>
            </view>
        </view>
    </view>
</template>

<script>
    /**
     * 骨架屏
     */
    export default {
        methods: {
            clear (e) {
                // TODO nvue 取消冒泡
                e.stopPropagation()
            },
        }
    }
</script>

<style lang="scss" scoped>
    .skeleton {
        height: 100%;
        position: initial;
        background-color: initial !important;

        .goods-warp {
            padding-left: 24rpx;
            padding-right: 24rpx;
            overflow: hidden;

            .goods-img {
                width: 200rpx;
                height: 200rpx;
                border-radius: 20rpx;
            }
        }

    }

    .br {
        border-radius: 10rpx;
    }

    .h28 {
        height: 28rpx;
    }

    .light-to-dark {
        animation: lightToDark 0.5s ease-in infinite;
    }

    .dark-to-dark {
        animation: darkToLight 0.5s ease-in infinite;
    }

    @keyframes lightToDark {
        0% {
            background: rgb(245, 245, 245);
        }

        50% {
            background: rgb(238, 238, 238);
        }

        100% {
            background: rgb(245, 245, 245);
        }
    }

    @keyframes darkToLight {
        0% {
            background: rgb(238, 238, 238);
        }

        50% {
            background: rgb(245, 245, 245);
        }

        100% {
            background: rgb(238, 238, 238);
        }
    }
</style>