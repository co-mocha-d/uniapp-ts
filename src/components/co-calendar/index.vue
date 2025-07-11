<!--
* @Description: 统计主页面 - 用于展示考勤统计信息，包含团队和个人两个维度的统计数据
* @Author: daidian
* @createTime: 2025-02-19 13:36:18
-->
<template>
    <view class="content">
        <!-- 顶部切换标签 - 用于团队/个人维度切换 -->
        <view class="nav-tabs" v-if="showTopTab">
            <u-tabs :list="mainTabs" :current="mainCurrentTab" @click="switchMainTab" lineColor="#333333"
                :itemStyle="{ width: '50%',height: '80rpx' }" :activeStyle="{
				color: '#333333',
				fontWeight: 'bold'
			}" :inactiveStyle="{
				color: '#606266',
				fontWeight: 'normal'
			}" />
        </view>



        <!-- 团队统计区域 -->
        <view class="bgf5 p-24" v-if="mainCurrentTab == 0">
            <!-- 统计内容卡片 -->
            <view class="bgf br-20 m-b-24 bg-white radius-20 p-30">
                <!-- 日期切换器 -->
                <view class="m-b-30">
                    <u-subsection activeColor="#333333" :list="navListTeam" :current="currentTabTeam"
                        @change="handleTabChange" />
                </view>

                <!-- 日-统计日历组件 -->
                <DayCalendar statisticType="team" v-show="currentTabTeam == 0" />
                <!-- 周-统计日历组件 -->
                <WeekCalendar statisticType="team" v-if="currentTabTeam == 1" />
                <!-- 月-统计日历组件 -->
                <MonthCalendar statisticType="team" v-if="currentTabTeam == 2" />
            </view>
        </view>

        <!-- 个人统计区域 -->
        <view v-if="mainCurrentTab == 1" class="card">
            <!-- 用户信息区域 -->
            <view class="user-info flex flex-a-center p-b-20">
                <!-- 用户头像 -->
                <oa-avatar :src="userInfo?.avatar" :name="userInfo?.admin_name" size="80" :round="false" radius="10" />

                <!-- 用户基本信息 -->
                <view class="flex-1 m-l-20">
                    <view class="fs-30 fc3">{{ userInfo?.admin_name || '' }}</view>
                    <view class="flex flex-a-center m-t-4">
                        <view class="fs-26 fc9  u-line-1" style="width: 140rpx;">
                            {{userInfo?.attendance_group_name || ''}}
                        </view>
                        <view class="fs-26 fc6 m-l-10 fcb" @click="goRule">(查看规则)</view>
                    </view>
                </view>

                <!-- 日历切换区域 -->
                <view class="calendar-tabs flex flex-a-center flex-j-center">
                    <up-subsection v-if="mainCurrentTab === 1" :list="navListPersonal" :current="currentTabPersonal"
                        activeColor="#333333" @change="switchTabPersonal" />
                </view>
            </view>

            <!-- 分割线 -->
            <view class="divider-wrap">
                <up-divider />
            </view>


            <!-- 日-统计日历组件 -->
            <DayCalendar ref="personalDayCalendarRef" :relationAdminId="relationAdminId"
                v-show="currentTabPersonal == 0" @getUserInfo="getUserInfo" :defaultDate="defaultDate"/>
            <!-- 周-统计日历组件 -->
            <WeekCalendar :relationAdminId="relationAdminId" v-if="currentTabPersonal == 1" />
            <!-- 月-统计日历组件 -->
            <MonthCalendar ref="personalMonthCalendarRef" :relationAdminId="relationAdminId"
                v-if="currentTabPersonal == 2" :defaultDate="defaultDate"/>
        </view>
    </view>
</template>

<script setup>
    import { ref, computed } from 'vue'
    import { useUserStore } from '@/store/index'
    import DayCalendar from './DayCalendar.vue'
    import WeekCalendar from './WeekCalendar.vue'
    import MonthCalendar from './MonthCalendar.vue'
    import { navListPersonal, mainTabs, navListTeam } from './index.config.js'

    // 获取用户状态管理
    const userStore = useUserStore()

    // 当前选中的个人统计tab索引
    const currentTabPersonal = ref(0)
    // 当前选中的团队统计tab索引
    const currentTabTeam = ref(0)
    // 是否显示顶部切换tab
    const showTopTab = ref(true)
    // 当前主tab索引（团队/个人）
    const mainCurrentTab = ref(0)

    // 个人统计日历组件
    const personalDayCalendarRef = ref(null)
    // 个人统计月历组件
    const personalMonthCalendarRef = ref(null)

    // 关系人id
    const relationAdminId = ref('')
    // 用户信息
    const userInfo = ref({})

    const defaultDate = ref('')



    const getUserInfo = (data) => {
        userInfo.value = data
    }

    /**
     * 切换主tab处理函数
     * @param {Object} data - 切换事件数据
     */
    const switchMainTab = (data) => {
        mainCurrentTab.value = data.index
    }

    /**
     * 切换个人统计tab处理函数
     * @param {number} index - 目标tab索引
     */
    const switchTabPersonal = (index) => {
        currentTabPersonal.value = index
    }

    /**
     * 切换团队统计tab处理函数
     * @param {number} index - 目标tab索引
     */
    const handleTabChange = (index) => {
        currentTabTeam.value = index
    }

    const goRule = () => {
        uni.navigateTo({
            url: `/pagesApply/statistics/rule?relationAdminId=${relationAdminId.value}`
        })
    }

    /**
     * 页面加载处理函数
     * @param {Object} option - 页面参数
     */
    onLoad((option) => {
        console.log('页面加载处理函数')
        console.log('option====', option)
        // 处理是否显示顶部tab
        if (option?.showTopTab == 0) {
            showTopTab.value = false
        } else {
            showTopTab.value = true
        }

        // 设置当前主tab
        mainCurrentTab.value = Number(option?.mainCurrentTab || 0)

        if (option.relationAdminId) {
            relationAdminId.value = option.relationAdminId
        }

        // 不是管理员
        if (userStore?.userInfo?.admin_info?.is_department_super != 1) {
            showTopTab.value = false
            mainCurrentTab.value = 1
        }

        if (option.currentTabPersonal) {
            currentTabPersonal.value = Number(option.currentTabPersonal)
        }

        if (option.date) {
             defaultDate.value = option.date
            nextTick(() => {
                setTimeout(() => {
                    if (currentTabPersonal.value == 0) {
                        console.log('选择日期')
                        personalDayCalendarRef.value?.setSelectedDate(option.date)
                    }

                    if (currentTabPersonal.value == 2) {
                        console.log('选择月份===')
                       
                        personalMonthCalendarRef.value?.selectMonth(option.date)
                    }
                }, 800)
            })
        }

    })
</script>

<style lang="scss" scoped>
    /* 页面根容器样式 */
    .content {
        width: 100vw;
        min-height: 100vh;
        box-sizing: border-box;
        padding-bottom: max(env(safe-area-inset-bottom), 20rpx);
        background-color: #f5f5f5;
    }

    :deep(.u-subsection__item__text) {
        font-size: 24rpx !important;
    }


    /* 用户信息区域样式 */
    .user-info {
        background-color: #fff;
    }

    .divider-wrap {
        :deep(.u-divider) {
            margin: 0 !important;
        }
    }

    /* 日历切换标签样式 */
    .calendar-tabs {
        width: 200rpx;
        background-color: #fff;
        padding: 20rpx 0;
    }

    .nav-tabs {
        position: sticky;
        top: 0;
        z-index: 100;
    }

    /* 卡片容器样式 */
    .card {
        background-color: #fff;
        border-radius: 20rpx;
        margin: 24rpx;
        overflow: hidden;
        padding: 30rpx;
    }

    /* 底部状态区域样式 */
    .bottom-status {
        margin-top: 60rpx;

        /* 状态图标样式 */
        .status-icon {
            width: 200rpx;
            height: 200rpx;
        }
    }

    /* tabs组件样式调整 */
    :deep(.u-tabs__wrapper) {
        background-color: #fff;
        padding: 10rpx 0;
    }
</style>