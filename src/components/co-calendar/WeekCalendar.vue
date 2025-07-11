<!--
* @Description: 周统计组件
* @Author: daidian
* @createTime: 2025-02-19 13:36:18
-->
<template>
    <view class="calendar-wrap">
        <!-- 年月和回到本周 -->
        <view class="flex flex-between flex-a-center p-y-20">
            <view class="fs-32 fc3 flex-a-center">{{ currentYearMonth.year}}<text
                    class="fcf5 m-x-10">|</text>{{currentYearMonth.start+'-'+currentYearMonth.end}}
            </view>
            <view class="fs-28 fc9" @click="backToCurrentWeek" v-if="showBackToCurrentWeek">回到本周</view>
        </view>

        <!-- 周切换 -->
        <swiper class="week-swiper" :style="{height:swiperWeeks[swiperCurrent].length > 4 ?  '160rpx': '80rpx'}"
            :current="swiperCurrent" @change="handleSwiperChange" :circular="false" :duration="300">
            <swiper-item v-for="(monthWeeks, groupIndex) in swiperWeeks" :key="groupIndex">
                <view class="week-grid p-x-30">
                    <view class="tab-item" :class="{ active: isActiveWeek(week),isToday: isToday(week) }"
                        v-for="(week, index) in monthWeeks" :key="index" @click="selectWeek(week, index)">
                        <text>第{{ week.weekNumber }}周</text>
                    </view>
                </view>
            </swiper-item>
        </swiper>
        <view class="m-y-30">
        <up-divider></up-divider>
        </view>


        <!-- 考勤统计 -->
        <StatisticsPanel timeType="week" :panelData="panelData" :selectedDate="selectedDate"
            :statisticType="statisticType" :relationAdminId="relationAdminId" v-if="!showEmpty">
        </StatisticsPanel>

        <!-- 空数据 -->
        <oa-empty v-if="showEmpty" paddingBottom="50rpx" content="暂无统计结果"></oa-empty>

    </view>
</template>

<script setup>
    import {
        ref,
        computed
    } from 'vue'
    import dayjs from 'dayjs'
    import isBetween from 'dayjs/plugin/isBetween'
    import isSameOrAfter from 'dayjs/plugin/isSameOrAfter'
    import StatisticsPanel from './StatisticsPanel.vue'
    import 'dayjs/locale/zh-cn'
    // 注册插件
    dayjs.extend(isBetween)
    dayjs.extend(isSameOrAfter)
    dayjs.locale('zh-cn')

    const props = defineProps({
        // 统计类型
        statisticType: {
            type: String,
            default: 'personal'
        },
        relationAdminId: {
            type: String,
            default: ''
        }
    })

    // 考勤统计数据
    const panelData = ref([])


    // 当前选中的日期
    const selectedDate = ref(dayjs().format('YYYY-MM-DD'))
    // 当前选中的周索引
    const currentWeekIndex = ref(0)
    // 轮播相关状态
    const swiperCurrent = ref(6) // 中间位置
    const swiperWeeks = ref([])
    // 是否显示空数据
    const showEmpty = ref(false)

    // 添加一个标记，用于区分是否是从"回到本周"触发的切换
    const isBackToCurrentWeek = ref(false)

    // 年月显示
    const currentYearMonth = computed(() => {
        const start = dayjs(selectedDate.value)
        const weekStart = start.startOf('week')
        const weekEnd = start.endOf('week')

        return {
            year: weekStart.format('YYYY'),
            start: weekStart.format('M.D'),
            end: weekEnd.format('M.D')
        }
    })

    // 当前周数据
    const currentWeekData = computed(() => {
        return swiperWeeks.value[swiperCurrent.value][currentWeekIndex.value]
    })


    const showBackToCurrentWeek = computed(() => {
        const start = dayjs(selectedDate.value)
        const weekStart = start.startOf('week')
        const weekEnd = start.endOf('week')

        return !isToday({
            start: weekStart.format('YYYY-MM-DD'),
            end: weekEnd.format('YYYY-MM-DD')
        })
    })

    // 格式化周日期显示
    const formatWeekDate = (week) => {
        const start = dayjs(week.start)
        const end = dayjs(week.end)
        if (start.month() !== end.month()) {
            return `${start.format('M.D')}-${end.format('M.D')}`
        }
        return `${start.format('M.D')}-${end.format('D')}`
    }

    // 数字转中文数字
    const numberToChinese = (num) => {
        const chineseNumbers = ['一', '二', '三', '四', '五', '六', '七', '八', '九', '十']
        return chineseNumbers[num - 1]
    }


    // 获取当前月份的所有周
    const getMonthWeeks = (date) => {
        const currentDate = dayjs(date)
        const startOfMonth = currentDate.startOf('month')
        const endOfMonth = currentDate.endOf('month')
        const weeks = []
        let weekStart = startOfMonth.startOf('week')
        let weekNumber = 1

        while (weekStart.isBefore(endOfMonth)) {
            const weekEnd = weekStart.add(6, 'day')

            // 检查这周是否完全在当前月内
            const isWithinMonth = weekEnd.month() === currentDate.month()

            // 如果这周包含下个月的任何日期，直接跳出循环
            if (!isWithinMonth) {
                break
            }

            weeks.push({
                start: weekStart.format('YYYY-MM-DD'),
                end: weekEnd.format('YYYY-MM-DD'),
                weekNumber: numberToChinese(weekNumber), // 使用中文数字
                month: weekStart.month()
            })
            weekStart = weekStart.add(1, 'week')
            weekNumber++
        }

        return weeks
    }

    // 判断是否是当前选中的周
    const isActiveWeek = (week) => {
        const selectedDay = dayjs(selectedDate.value)
        return selectedDay.isBetween(dayjs(week.start), dayjs(week.end), 'day', '[]')
    }

    // 判断是否是今天
    const isToday = (week) => {
        const today = dayjs()
        return today.isBetween(dayjs(week.start), dayjs(week.end), 'day', '[]')
    }


    // 选择周
    const selectWeek = (week, index) => {
        selectedDate.value = week.start
        currentWeekIndex.value = index

        // 如果是未来的周提示
        if (dayjs(week.start).isAfter(dayjs())) {
            uni.showToast({
                title: '不能查看未来的统计数据',
                icon: 'none'
            })
            showEmpty.value = true
            return
        } else {
            showEmpty.value = false
            getStatisticsData()
        }

    }

    // 处理轮播切换
    const handleSwiperChange = (e) => {
        const {
            current
        } = e.detail
        swiperCurrent.value = current
        // 如果是从"回到本周"触发的切换，不做处理
        if (isBackToCurrentWeek.value) {
            nextTick(() => {
                isBackToCurrentWeek.value = false
            })
            return
        }

        // 正常切换时默认选中第一周
        const currentMonthWeeks = swiperWeeks.value[current]
        if (currentMonthWeeks && currentMonthWeeks.length > 0) {
            // 选择新月份的第一周
            selectedDate.value = currentMonthWeeks[0].start
            currentWeekIndex.value = 0
        }


        // 如果是未来周，则提示不能查看未来的统计数据
        if (dayjs(selectedDate.value).isAfter(dayjs())) {
            uni.showToast({
                title: '不能查看未来的统计数据',
                icon: 'none'
            })
            showEmpty.value = true
            return
        } else {
            getStatisticsData()
            showEmpty.value = false
        }
    }

    // 初始化轮播数据
    const initSwiperWeeks = () => {
        const today = dayjs()
        const baseDate = today.startOf('month')
        console.log('baseDate',baseDate)
        swiperWeeks.value = [
            getMonthWeeks(baseDate.subtract(6, 'month')),
            getMonthWeeks(baseDate.subtract(5, 'month')),
            getMonthWeeks(baseDate.subtract(4, 'month')),
            getMonthWeeks(baseDate.subtract(3, 'month')),
            getMonthWeeks(baseDate.subtract(2, 'month')),
            getMonthWeeks(baseDate.subtract(1, 'month')),
            getMonthWeeks(baseDate), // 当前月在中间位置
            getMonthWeeks(baseDate.add(1, 'month')),
            getMonthWeeks(baseDate.add(2, 'month')),
            getMonthWeeks(baseDate.add(3, 'month')),
            getMonthWeeks(baseDate.add(4, 'month')),
            getMonthWeeks(baseDate.add(5, 'month')),
            getMonthWeeks(baseDate.add(6, 'month'))
        ]

        // 获取当前日期所在的周
        const currentWeekStart = today.startOf('week')
        const currentWeekEnd = today.endOf('week')

        // 检查当前周是否包含下个月的1号
        const nextMonthFirstDay = today.add(1, 'month').startOf('month')
        const containsNextMonthFirstDay = nextMonthFirstDay.isBetween(currentWeekStart, currentWeekEnd, 'day', '[]')

        if (containsNextMonthFirstDay) {
            // 如果包含下个月1号，切换到下个月
            swiperCurrent.value = 7 // 当前月索引是6，下个月就是7

            // 找到下个月的第一周
            const nextMonthWeeks = swiperWeeks.value[7]
            if (nextMonthWeeks && nextMonthWeeks.length > 0) {
                selectedDate.value = nextMonthWeeks[0].start
                currentWeekIndex.value = 0
            }
        } else {
            // 不包含下个月1号，保持在当前月
            swiperCurrent.value = 6

            // 在当前月的周数据中找到包含今天的那一周
            const currentMonthWeeks = swiperWeeks.value[6]
            const todayStr = today.format('YYYY-MM-DD')

            // 找到包含今天的周的索引
            const weekIndex = currentMonthWeeks.findIndex(week =>
                dayjs(todayStr).isBetween(dayjs(week.start), dayjs(week.end), 'day', '[]')
            )

            // 设置为包含今天的周
            currentWeekIndex.value = weekIndex !== -1 ? weekIndex : 0
            if (weekIndex !== -1) {
                selectedDate.value = currentMonthWeeks[weekIndex].start
            }
        }

        console.log('周数据', swiperWeeks.value)
    }

    // 回到本周
    const backToCurrentWeek = () => {
        // 设置标记，表示这是从"回到本周"触发的切换
        isBackToCurrentWeek.value = true

        const today = dayjs()
        const weekStart = today.startOf('week')
        selectedDate.value = weekStart.format('YYYY-MM-DD')

        // 重新初始化数据
        initSwiperWeeks()
        // swiperCurrent.value = 6

        // 在当前月的周数据中找到包含今天的那一周
        const currentMonthWeeks = swiperWeeks.value[6]
        const todayStr = today.format('YYYY-MM-DD')

        // 找到包含今天的周的索引
        const weekIndex = currentMonthWeeks.findIndex(week =>
            dayjs(todayStr).isBetween(dayjs(week.start), dayjs(week.end), 'day', '[]')
        )

        // 设置为包含今天的周
        currentWeekIndex.value = weekIndex !== -1 ? weekIndex : 0

        nextTick(() => {
            showEmpty.value = false
            getStatisticsData()
        })
    }

    // 当前时间
    const currentTime = computed(() => {
        return dayjs().format('YYYY-MM-DD HH:mm')
    })

    // 初始化
    initSwiperWeeks()

    // 获取统计数据
    const getStatisticsData = () => {
        // 根据统计类型选择不同的接口
        let url = props.statisticType == 'personal' ? uni.$urls.statistics.getStatisticsData : uni.$urls.statistics.getTeamStatisticsData
        let postData = {
            start_time: currentWeekData.value.start,
            end_time: currentWeekData.value.end,
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

</script>

<style lang="scss" scoped>
    .calendar-wrap {
        background-color: #fff;
    }

    .week-swiper {
        height: 120rpx;
        width: 100%;
    }

    :deep(.u-divider) {
        margin: 0 !important;
    }

    .week-grid {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        /* flex-wrap: nowrap; */
        overflow-x: auto;
        gap: 20rpx;
        padding: 20rpx 0;

        .tab-item {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 10rpx 20rpx;
            border-radius: 30rpx;
            font-size: 28rpx;
            color: #333;
            white-space: nowrap;

            &.isToday {
                color: #0089ff;
                font-weight: bold;
                background-color: rgba(0, 137, 255, 0.1);
            }

            &.active {
                background: #0089ff;
                color: #fff;
                font-weight: bold;

                .week-date {
                    color: #fff !important;
                }
            }

            .week-date {
                margin-top: 4rpx;
            }
        }
    }
</style>