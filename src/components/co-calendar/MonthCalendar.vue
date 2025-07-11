<!--
* @Description: 月-统计日历组件 - 用于展示月度考勤统计的日历视图，支持月份选择和统计数据展示
* @Author: daidian
* @createTime: 2025-02-19 13:36:18
-->
<template>
    <view class="calendar-wrap">
        <!-- 顶部年月显示和回到本月按钮 -->
        <view class="flex flex-between flex-a-center p-y-20">
            <view class="fs-32 fc3 flex-a-center">
                {{ currentYearMonth.year }}<text class="fcf5 m-x-10">|</text>{{currentYearMonth.month}}
            </view>
            <!-- 回到本月按钮，仅在非本月时显示 -->
            <view class="fs-28 fc9" @click="backToCurrentMonth" v-if="!isToday(selectedDate)">回到本月</view>
        </view>

        <!-- 月份切换轮播 -->
        <swiper class="month-swiper" :current="swiperCurrent" @change="handleSwiperChange" :circular="false"
            :duration="300">
            <!-- 月份网格组 -->
            <swiper-item v-for="(monthGroup, groupIndex) in monthGroups" :key="groupIndex">
                <view class="month-grid p-x-30">
                    <!-- 单个月份选项 -->
                    <view class="tab-item" :class="{ 
                            active: isActiveMonth(month.date), 
                            isToday: isToday(month.date) 
                        }" v-for="(month, index) in monthGroup" :key="index" @click="selectMonth(month.date)">
                        {{ month.label }}
                    </view>
                </view>
            </swiper-item>
        </swiper>

        <!-- 分割线 -->
        <up-divider></up-divider>

        <!-- 统计面板 -->
        <StatisticsPanel timeType="month" :panelData="panelData" :selectedDate="selectedDate"
            :statisticType="statisticType" :relationAdminId="relationAdminId" v-if="!showEmpty" />

        <!-- 空数据提示 -->
        <oa-empty v-if="showEmpty" paddingBottom="50rpx" content="暂无统计结果"></oa-empty>
    </view>
</template>

<script setup>
    import {
        ref,
        computed
    } from 'vue'
    import dayjs from 'dayjs'
    import 'dayjs/locale/zh-cn'
    import StatisticsPanel from './StatisticsPanel.vue'


    // 设置dayjs语言为中文
    dayjs.locale('zh-cn')

    // 考勤统计数据
    const panelData = ref([])


    /**
     * 组件属性定义
     * @property {String} statisticType - 统计类型，可选值：'personal'|'team'，默认'personal'
     */
    const props = defineProps({
        statisticType: {
            type: String,
            default: 'personal'
        },
        relationAdminId: {
            type: String,
            default: ''
        }
    })

    // 组件状态
    const showEmpty = ref(false) // 是否显示空数据
    const selectedDate = ref(dayjs().format('YYYY-MM-DD')) // 当前选中的日期
    const swiperCurrent = ref(0) // 当前轮播索引

    /**
     * 初始化轮播当前索引
     * @description 根据当前月份计算应该显示哪个轮播组
     */
    const initSwiperCurrent = () => {
        const today = dayjs()
        const currentMonth = today.month()
        swiperCurrent.value = currentMonth < 6 ? 2 : 3 // 1-6月为2，7-12月为3
    }

    // 初始化轮播索引
    initSwiperCurrent()

    /**
     * 年月显示计算属性
     * @returns {Object} 包含年份和月份的对象
     */
    const currentYearMonth = computed(() => ({
        year: dayjs(selectedDate.value).format('YYYY'),
        month: dayjs(selectedDate.value).format('M月'),
    }))

    /**
     * 月份组数据计算属性
     * @description 生成前一年、当前年和下一年的月份数据
     */
    const monthGroups = computed(() => {
        const today = dayjs()
        const currentYear = today.year()

        /**
         * 生成月份组数据的辅助函数
         * @param {number} year - 年份
         * @param {number} startMonth - 起始月份(0-11)
         * @param {number} endMonth - 结束月份(0-11)
         * @returns {Array} 月份数据数组
         */
        const generateMonthGroup = (year, startMonth, endMonth) => {
            const group = []
            for (let month = startMonth; month < endMonth; month++) {
                const date = dayjs(`${year}-${month + 1}-01`)
                group.push({
                    label: `${month + 1}月`,
                    date: date.format('YYYY-MM-DD'),
                    year: date.format('YYYY')
                })
            }
            return group
        }

        return [
            generateMonthGroup(currentYear - 1, 0, 6), // 前一年1-6月
            generateMonthGroup(currentYear - 1, 6, 12), // 前一年7-12月
            generateMonthGroup(currentYear, 0, 6), // 当前年1-6月
            generateMonthGroup(currentYear, 6, 12), // 当前年7-12月
            generateMonthGroup(currentYear + 1, 0, 6) // 下一年1-6月
        ]
    })

    /**
     * 判断月份是否为当前选中月份
     * @param {string} date - 日期字符串
     * @returns {boolean} 是否为当前选中月份
     */
    const isActiveMonth = (date) => {
        return dayjs(date).format('YYYY-MM') === dayjs(selectedDate.value).format('YYYY-MM')
    }

    /**
     * 判断月份是否为当前月份
     * @param {string} date - 日期字符串
     * @returns {boolean} 是否为当前月份
     */
    const isToday = (date) => {
        return dayjs(date).format('YYYY-MM') === dayjs().format('YYYY-MM')
    }

    /**
     * 选择月份处理函数
     * @param {string} date - 选中的日期
     */
    const selectMonth = (date) => {
        console.log('monthGroups', monthGroups)
        console.log('date====', date)
        const clickedDate = dayjs(date)
        const currentDate = dayjs(selectedDate.value)
        const newDate = currentDate.year(clickedDate.year()).month(clickedDate.month())
        selectedDate.value = newDate.format('YYYY-MM-DD')
        console.log('selectedDate', selectedDate.value)

        // 查询日期是否在当前swiper中，不在则切换到对应的swiper
        const currentMonthGroup = monthGroups.value[swiperCurrent.value]
        const monthsInGroup = currentMonthGroup.map(m => dayjs(m.date))
        const isMonthInGroup = monthsInGroup.includes(date)
        console.log('isMonthInGroup', isMonthInGroup)
        if (!isMonthInGroup) {
            nextTick(() => {
                // 找到包含选中月份的月份组索引
                const targetGroupIndex = monthGroups.value.findIndex(group =>
                    group.some(m => m.date === date)
                )
                console.log('targetGroupIndex', targetGroupIndex)

                if (targetGroupIndex !== -1) {
                    swiperCurrent.value = targetGroupIndex
                }
            })
        }


        // 检查是否为未来日期
        if (dayjs(selectedDate.value).isAfter(dayjs())) {
            uni.showToast({
                title: '不能查看未来的统计数据',
                icon: 'none'
            })
            showEmpty.value = true
            return
        }
        //不能查询半年前的数据
        if (dayjs(selectedDate.value).isBefore(dayjs().subtract(6, 'month'), 'month')) {
            uni.showToast({
                title: '不能查询半年之前的数据',
                icon: 'none'
            })
            showEmpty.value = true
            return
        }

        getStatisticsData()
        showEmpty.value = false
    }

    /**
     * 轮播切换处理函数
     * @param {Object} e - 轮播切换事件对象
     */
    const handleSwiperChange = (e) => {
        const {
            current
        } = e.detail
        swiperCurrent.value = current

        // 获取当前选中的月份组
        const currentMonthGroup = monthGroups.value[current]

        // 获取当前选中的月份是否在当前组中
        const selectedMonth = dayjs(selectedDate.value).month()
        const monthsInGroup = currentMonthGroup.map(m => dayjs(m.date).month())
        const isMonthInGroup = monthsInGroup.includes(selectedMonth)

        if (!isMonthInGroup) {
            // 如果不在当前组中，选中当前组的第一个月
            selectedDate.value = currentMonthGroup[0].date
        } else {
            // 在当前组中，更新年份和保持原有月份
            const newYear = dayjs(currentMonthGroup[0].date).year()
            const newDate = dayjs(selectedDate.value)
                .year(newYear)
                .month(selectedMonth)
                .format('YYYY-MM-DD')
            selectedDate.value = newDate
        }

        if (dayjs(selectedDate.value).isAfter(dayjs())) {
            uni.showToast({
                title: '不能查看未来的统计数据',
                icon: 'none'
            })
            showEmpty.value = true
            return
        }
        //不能查询半年前的数据
        if (dayjs(selectedDate.value).isBefore(dayjs().subtract(6, 'month'), 'month')) {
            uni.showToast({
                title: '不能查询半年之前的数据',
                icon: 'none'
            })
            showEmpty.value = true
            return
        }

        getStatisticsData()
        showEmpty.value = false

    }

    /**
     * 回到本月处理函数
     */
    const backToCurrentMonth = () => {
        selectedDate.value = dayjs().format('YYYY-MM-DD')
        swiperCurrent.value = 2
        getStatisticsData()
    }



    /**
     * 统计项点击处理函数
     * @param {string} type - 统计项类型
     */
    const handleItemClick = (type) => {
        uni.navigateTo({
            url: `/pagesApply/statistics/personalStats?type=${type}`
        })
    }

    // 获取统计数据
    const getStatisticsData = () => {
        // 根据统计类型选择不同的接口
        let url = props.statisticType == 'personal' ? uni.$urls.statistics.getStatisticsData : uni.$urls.statistics.getTeamStatisticsData
        let postData = {
            start_time: dayjs(selectedDate.value).startOf('month').format('YYYY-MM-DD'),
            end_time: dayjs(selectedDate.value).endOf('month').format('YYYY-MM-DD'),
            relation_admin_id: props.statisticType == 'personal' ? props.relationAdminId : ''
        }
        uni.$doHttp
            .post(url, postData, { load: true })
            .then((res) => {
                panelData.value = res.total_list
            })
    }

    onMounted(() => {
        getStatisticsData()
    })

    // 抛出
    defineExpose({
        selectMonth
    });
</script>

<style lang="scss" scoped>
    /* 日历容器样式 */

    .calendar-wrap {
        background-color: #fff;
    }

    /* 分割线样式重置 */
    :deep(.u-divider) {
        margin: 0 !important;
    }

    /* 警告文字颜色 */

    .orange {
        color: #f2a33a;
    }

    /* 月份轮播样式 */

    .month-swiper {
        height: 110rpx;
        width: 100%;
    }

    /* 月份网格样式 */

    .month-grid {
        display: grid;
        grid-template-columns: repeat(6, 1fr);
        gap: 20rpx;
        padding: 20rpx 0;
        height: 100%;
        box-sizing: border-box;

        /* 月份选项样式 */
        .tab-item {
            white-space: nowrap;
            margin: 0 auto;
            position: relative;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 26rpx;
            color: #333;
            width: 64rpx;
            height: 64rpx;
            border-radius: 50%;
            text-align: center;

            /* 当前月份样式 */
            &.isToday {
                color: #0089ff;
                font-weight: bold;
                background-color: rgba(0, 137, 255, 0.1);
            }

            /* 选中月份样式 */
            &.active {
                background: #0089ff;
                color: #fff;
                font-weight: bold;
            }
        }
    }

    /* 详情按钮样式 */

    .detail-btn {
        height: 80rpx;
        line-height: 80rpx;
        background-color: #f5f5f5;
        border-radius: 40rpx;
    }
</style>