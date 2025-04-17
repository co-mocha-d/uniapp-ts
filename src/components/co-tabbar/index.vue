<template>
    <up-tabbar :customStyle="{height:'70rpx'}" :value="currentName" :placeholder="true" :active-color="activeColor"
        :inactive-color="inactiveColor" @change="handleTabChange" :safe-area-inset-bottom="safeAreaInsetBottom">
        <!-- 动态渲染 TabBar 项 -->
        <up-tabbar-item v-for="(item, index) in tabList" :key="index" :text="item.text" :name="item.name">
            <!-- 自定义图标 -->
            <template #icon>
                <image class="tab-icon" :src="currentName === index ? item.selectedIcon : item.icon" />
            </template>
        </up-tabbar-item>
    </up-tabbar>
</template>

<script setup>
    import { ref, onMounted } from 'vue';
    // 配置 TabBar 数据
    const tabList = [
        {
            name: 'home',
            text: '首页',
            icon: '/static/home.png',
            selectedIcon: '/static/home-active.png',
            pagePath: '/pages/home/index'
        },
        // {
        //     name: 'category',
        //     text: '分类',
        //     icon: '/static/category.png',
        //     selectedIcon: '/static/category-active.png',
        //     pagePath: '/pages/category/index'
        // },
        {
            name: 'user',
            text: '我的123',
            icon: '/static/user.png',
            selectedIcon: '/static/user-active.png',
            pagePath: '/pages/user/index'
        }
    ]



    // 接收外部配置
    const props = defineProps({
        activeColor: {
            type: String,
            default: '#ff6600'
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
    const currentName = ref('');
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

<style scoped>
    .tab-icon {
        width: 48rpx;
        height: 48rpx;
    }
</style>