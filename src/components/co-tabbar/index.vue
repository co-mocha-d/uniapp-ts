<template>
    <view>
        <up-tabbar :customStyle="{height:'90rpx'}" :value="currentName" :activeColor="activeColor"
            :inactiveColor="inactiveColor" @change="handleTabChange" :safe-area-inset-bottom="safeAreaInsetBottom">
            <!-- 动态渲染 TabBar 项 -->
            <up-tabbar-item v-for="(item, index) in tabList" :key="index" :text="item.text" :name="item.name">

                <!-- 自定义图标 -->
                <!-- <template v-slot:[getIconSlot(item.name)]>
				<image class="tab-icon" :src="currentName === item.name ? item.selectedIcon : item.icon" />
			</template> -->
                <template #active-icon>
                    <image class="tab-icon" style="width: 48rpx;height: 48rpx;" :src="item.selectedIcon"
                        mode="aspectFit" />
                </template>
                <template #inactive-icon>
                    <image class="tab-icon" style="width: 48rpx;height: 48rpx;" :src="item.icon" mode="aspectFit" />
                </template>
            </up-tabbar-item>

        </up-tabbar>
    </view>
</template>

<script setup>
    import {
        ref,
        onMounted
    } from 'vue';
    // 配置 TabBar 数据
    const tabList = [{
        name: 'home',
        text: '首页',
        icon: '/static/tabbar/home.png',
        selectedIcon: '/static/tabbar//home_active.png',
        pagePath: '/pages/home/index'
    },
    {
        name: 'user',
        text: '我的',
        icon: '/static/tabbar/mine.png',
        selectedIcon: '/static/tabbar/mine_active.png',
        pagePath: '/pages/user/index'
    }
    ]



    // 接收外部配置
    const props = defineProps({
        activeColor: {
            type: String,
            default: '#1296db'
        },
        inactiveColor: {
            type: String,
            default: '#666666'
        },
        safeAreaInsetBottom: {
            type: Boolean,
            default: true
        },
        name: {
            type: String,
            default: 'home'
        }
    });


    // 当前选中的 tab 索引
    const currentName = ref('home');
    const getIconSlot = (name) => {
        return currentName.value === name ? 'active-icon' : 'inactive-icon'
    }


    const emit = defineEmits(['update:name'])

    // 处理 Tab 点击事件
    const handleTabChange = (name) => {
        console.log('处理 Tab 点击事件===', name)

        if (currentName.value === name) return;
        currentName.value = name;
        const target = tabList.find(e => e.name == name);
        emit('update:name', name)
    };
</script>

<style lang="scss" scoped>
    .tab-icon {
        width: 48rpx;
        height: 48rpx;
    }
</style>