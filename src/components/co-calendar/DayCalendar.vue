<!--
* @Description: 日-统计日历组件 - 用于展示每日考勤统计的日历视图，支持日期选择和考勤状态展示
* @Author: daidian
* @createTime: 2025-02-19 13:36:18
-->
<template>
    <!-- 日历主体区域 -->
    <view class="calendar-wrap">
        <!-- 顶部日期选择器和回到今天按钮 -->
        <view class="flex flex-between flex-a-center p-y-20">
            <view class="fs-32 fc3 flex-a-center">{{ currentYear }}<text class="fcf5 m-x-10">|</text>{{ currentDate }}
            </view>
            <!-- 回到今天按钮，仅在非今天时显示 -->
            <view class="fs-28 fc9" @click="backToToday" v-if="!isToday(selectedDate)">回到今天</view>
        </view>

        <view class="p-20 br-10 bgf5 pr" v-if="statisticType == 'personal' && statisticsStore?.showAttendanceTip">

            <view class="pa right-20 top-20" @click="statisticsStore?.setShowAttendanceTip(false)">
                <up-icon name="close" color="#999" size="18"></up-icon>
            </view>

            <!-- 正常 -->
            <view class="flex nowrap flex-a-center ">
                <view class="dot flexs0 normal m-r-10"></view>
                <view class="fs-24 fc3">
                    全天考勤正常
                </view>
            </view>

            <!-- 异常 -->
            <view class="flex nowrap flex-a-center m-t-6">
                <view class="dot flexs0 warning m-r-10"></view>
                <view class="fs-24 fc3">
                    当天存在异常：迟到、早退、缺卡
                </view>
            </view>

            <!-- 补卡 -->
            <view class="flex nowrap flex-a-center m-t-6">
                <view class="dot flexs0 tip m-r-10"></view>
                <view class="fs-24 fc3">
                    当前提交过：请假、加班、出差、外出、补卡申请
                </view>
            </view>
        </view>


        <!-- 星期表头 -->
        <view class="week-header flex flex-a-center m-t-30">
            <view class="week-item fs-26 fc9" v-for="item in weekDays" :key="item">{{ item }}</view>
        </view>
        <view class="flex flex-center" style="height: 200rpx;" v-if="loading">
            <up-loading-icon mode="circle"></up-loading-icon>
        </view>


        <!-- 使用swiper组件 -->
        <template v-if="!loading">
            <swiper class="calendar-swiper" :style="{height: isShowMore ? swiperHeight + 'rpx' : '150rpx'}"
                :current="swiperCurrent" @change="handleSwiperChange" :circular="false" :duration="300">
                <swiper-item v-for="(monthData, index) in swiperMonths" :key="index">
                    <!-- 日期网格 -->
                    <view class="days-grid p-y-24">
                        <view class="grid-row flex" v-for="(row, rowIndex) in monthData" :key="rowIndex"
                            v-show="isShowMore || (!isShowMore && rowIndex == currentRowIndex)">
                            <view class="grid-item m-b-40 flex flex-column flex-a-center pr"
                                v-for="(day, colIndex) in row" :key="colIndex" @click="selectDate(day)">
                                <view class="day-number" :class="{ 
                                    'current': day.date === currentDateLine,
                                    'other-month': !day.isCurrentMonth || (day?.is_rest == 1 && !day?.punch_in_time_data?.time && !day?.punch_out_time_data?.time),
                                    'selected': day.date === selectedDate,
                                    'disabled': isDateDisabled(day.date),
                                    'isToday': day.isToday
                                }">
                                    {{ day.dayNumber }}
                                </view>
                                <view class="status-dots flex flex-a-center"
                                    v-if="day?.status_data && statisticType=='personal' && day.isCurrentMonth">
                                    <!-- 正常 -->
                                    <view class="dot flexs0 normal" v-if="day?.status_data?.is_normal=='1'"></view>
                                    <!-- 异常 -->
                                    <view class="dot flexs0 warning" v-if="day?.status_data?.is_abnormal=='1'"></view>
                                    <!-- 补卡 -->
                                    <view class="dot flexs0 tip" v-if="day?.status_data?.is_overtime_requests=='1'">
                                    </view>
                                </view>

                                <view class="fs-24 fc9 pa" style="bottom: -28rpx;" v-if="day.isCurrentMonth">
                                    {{day?.is_rest == 1 ? '休息' : day?.classes_name || ''}}
                                </view>
                            </view>
                        </view>
                    </view>
                </swiper-item>
            </swiper>
        </template>
        <view class="flex flex-a-center flex-j-center" @click="isShowMore = !isShowMore">
            <up-line length="280rpx" margin="0 10rpx"></up-line>
            <up-icon :name="isShowMore ? 'arrow-up' : 'arrow-down'" color="#ccc" size="28"></up-icon>
            <up-line length="280rpx" margin="0 10rpx"></up-line>
        </view>


        <!-- 当日信息展示 - 个人 -->
        <template v-if="statisticType === 'personal'">
            <view class="p-y-30">
                <view class="fs-28 fc9">当日班次：{{currentDayData?.classes_text || '当前无排班'}}</view>
                <view class="fs-28 fc9 m-t-10">出勤统计：打卡{{currentDayData?.clock_in_records_num || 0}}次</view>
            </view>
            <template v-if="!judgeEmpty.showEmpty">

                <!-- 补卡申请 -->
                <swiper :style="{height: currentDayData?.overtime_requests_data?.length > 1 ? '170rpx' : '140rpx'}"
                    :circular="false" :autoplay="false" indicator-color="#c9c9c9"
                    :next-margin="currentDayData?.overtime_requests_data?.length > 1 ? '100rpx' : '0rpx'"
                    indicator-active-color="#9fa4aa"
                    :indicator-dots="currentDayData?.overtime_requests_data?.length > 1" :duration="300"
                    v-if="currentDayData?.overtime_requests_data?.length > 0">
                    <swiper-item v-for="item in currentDayData?.overtime_requests_data" :key="item"
                        @click="goOvertimeRequestDetail(item)">
                        <view class="personal-card p-x-20 p-y-10 m-t-10 m-b-40"
                            :style="{marginRight: currentDayData?.overtime_requests_data?.length > 1 ? '20rpx' : '0rpx'}">
                            <view class="flex flex-a-center flex-between">
                                <view class="fs-28 fc3 fwb flex flex-a-center">
                                    <image class="width-40 height-40" :src="$tools.getOSSImageUrl('icon_bk_tj.png')"
                                        mode="aspectFill" />
                                    <view class="m-l-10">
                                        {{item?.title || ''}}
                                    </view>
                                </view>
                                <view class="fs-26 fc9 m-l-10 flex flex-a-center">
                                    <view class="m-r-10">
                                        {{item?.status_text || ''}}
                                    </view>
                                    <up-icon name="arrow-right" color="#ccc" size="16"></up-icon>
                                </view>
                            </view>
                        </view>
                    </swiper-item>
                </swiper>

                <view class="time-detail pr flex flex-column">
                    <view class="flex m-t-17 pr">
                        <view class="circle-icon width-12 height-12 m-r-20 flexs0"></view>
                        <view class="flex flex-column pr m-b-40" style="top: -20rpx;">
                            <view class="flex flex-a-center fc6 fs-32">
                                <view>上班 {{currentDayData?.punch_in_time_data?.time || '未打卡'}}</view>
                                <view class="m-l-10 box-card box-q-card"
                                    v-if="currentDayData?.punch_in_time_data?.is_miss == 1">缺卡</view>
                                <view class="m-l-10 box-card box-q-card"
                                    v-if="currentDayData?.punch_in_time_data?.is_late == 1">迟到</view>
                                <view class="m-l-10 box-card box-bk-card"
                                    v-if="currentDayData?.punch_in_time_data?.is_replace == 1">补卡</view>
                                <view class="m-l-10 box-card box-bk-card"
                                    v-if="currentDayData?.punch_in_time_data?. is_rest == 1">请假</view>
                            </view>
                            <!-- 迟到信息 -->
                            <view class="flex flex-a-center m-t-20"
                                v-if="currentDayData?.punch_in_time_data?.is_late == 1 &&currentDayData?.error_info?.late_minutes_text">
                                <u-icon name="info-circle" color="#666" size="18"></u-icon>
                                <view class="fc6 fs-26 m-l-5">{{currentDayData?.error_info?.late_minutes_text || ''}}
                                </view>
                            </view>
                            <template
                                v-if="currentDayData?.punch_in_time_data?.is_error == 0 && currentDayData?.punch_in_time_data?.time">
                                <view class="flex flex-a-center m-t-20">
                                    <u-icon name="wifi" color="#666" size="22"></u-icon>
                                    <view class="fc6 fs-26 m-l-5">tfxk</view>
                                </view>
                                <view class="flex flex-a-center m-t-20">
                                    <image class="width-38 height-38" :src="$tools.getOSSImageUrl('icon_face_tj.png')"
                                        mode="aspectFill" />
                                    <view class="fc6 fs-26 m-l-5">人脸识别已通过</view>
                                </view>
                            </template>

                            <view class="flex flex-a-center m-t-20 error-btn flex-center"
                                @click="errorHandle('morning')"
                                v-if="currentDayData?.punch_in_time_data?.is_error == 1 && (userInfo?.admin_id == relationAdminId || !relationAdminId)">
                                处理异常
                            </view>
                        </view>
                        <view class="line-step pa width-4 flex-1"></view>
                    </view>

                    <view class="flex m-t-17">
                        <view class="circle-icon width-12 height-12 pr m-r-20 flexs0">
                        </view>
                        <view class="flex flex-column pr" style="top: -20rpx;">
                            <view class="flex flex-a-center fc6 fs-32">
                                <view>下班 {{currentDayData?.punch_out_time_data?.time || '未打卡'}}</view>

                                <view class="m-l-10 box-card box-q-card"
                                    v-if="currentDayData?.punch_out_time_data?.is_miss == 1">缺卡</view>
                                <view class="m-l-10 box-card box-q-card"
                                    v-if="currentDayData?.punch_out_time_data?.is_early == 1">早退</view>
                                <view class="m-l-10 box-card box-bk-card"
                                    v-if="currentDayData?.punch_out_time_data?.is_replace == 1">补卡</view>
                                <view class="m-l-10 box-card box-bk-card"
                                    v-if="currentDayData?.punch_out_time_data?.is_rest == 1">请假</view>
                            </view>
                            <!-- 早退信息 -->
                            <view class="flex flex-a-center m-t-20"
                                v-if="currentDayData?.punch_in_time_data?.is_early == 1 && currentDayData?.error_info?.early_minutes_text">
                                <u-icon name="info-circle" color="#666" size="18"></u-icon>
                                <view class="fc6 fs-26 m-l-5">{{currentDayData?.error_info?.early_minutes_text || ''}}
                                </view>
                            </view>

                            <template
                                v-if="currentDayData?.punch_out_time_data?.is_error == 0 && currentDayData?.punch_out_time_data?.time">
                                <view class="flex flex-a-center m-t-20">
                                    <u-icon name="wifi" color="#666" size="22"></u-icon>
                                    <view class="fc6 fs-26 m-l-5">tfxk</view>
                                </view>
                                <view class="flex flex-a-center m-t-20">
                                    <image class="width-38 height-38" :src="$tools.getOSSImageUrl('icon_face_tj.png')"
                                        mode="aspectFill" />
                                    <view class="fc6 fs-26 m-l-5">人脸识别已通过</view>
                                </view>
                            </template>

                            <view class="flex flex-a-center m-t-20 error-btn flex-center"
                                @click="errorHandle('afternoon')"
                                v-if="currentDayData?.punch_out_time_data?.is_error == 1 && (userInfo?.admin_id == relationAdminId || !relationAdminId)">
                                处理异常
                            </view>
                        </view>
                    </view>
                </view>
            </template>

        </template>


        <!-- 当日信息展示*****团队 -->
        <template v-if="statisticType === 'team' && !judgeEmpty.showEmpty">
            <!-- 半圆进度指示器 -->
            <view v-show="!showProgress" style="height: 450rpx;"></view>
            <view class="progress-container pr flex flex-j-center flex-center m-y-60" @click="toClickInDetail">
                <CustomProgress :value="Number(progressValue)" v-show="showProgress">
                </CustomProgress>
                <!-- 文字内容 -->
                <view class="progress-text text-center flex-center flex-column">
                    <view class="fs-40 fwb">{{currentDayData?.attendance_data?.attendance_num ||
                        0}}/{{currentDayData?.attendance_data?.should_attendance_num || 0}}</view>
                    <view class="fs-24 fc9">打卡人数/应到人数</view>
                </view>
            </view>

            <!-- 统计数据 -->
            <view class="flex flex-around m-b-40 pr z-10" style="margin-top: -140rpx;">
                <!-- <view class="flex flex-column flex-a-center">
                    <text class="fs-36 fwb">0</text>
                    <text class="fs-28 fc9 m-t-8">外勤</text>
                </view> -->
                <view class="flex flex-column flex-a-center" @click="goLateList">
                    <text class="fs-36 fwb">{{currentDayData?.attendance_data?.late_num || 0}}</text>
                    <text class="fs-28 fc9 m-t-8">迟到</text>
                </view>
                <view class="flex flex-column flex-a-center" @click="goAbsenteeismList">
                    <text class="fs-36 fwb">{{currentDayData?.attendance_data?.absenteeism_num || 0}}</text>
                    <text class="fs-28 fc9 m-t-8">未打卡</text>
                </view>
            </view>


            <view class="flex m-t-20 m-b-50 flex-a-center"
                v-if="currentDayData.rest_attendance_list?.list?.length > 0 || currentDayData.leave_attendance_list?.list?.length > 0">
                <view class="bgf5 p-10 br-10 fs-26 fc3 m-r-20" @click="goRestList('rest')"
                    v-if="currentDayData.rest_attendance_list?.list?.length > 0">
                    休息({{currentDayData.rest_attendance_list?.list?.length}})
                </view>
                <view class="bgf5 p-10 br-10 fs-26 fc3" @click="goLeaveList('leave')"
                    v-if="currentDayData.leave_attendance_list?.list?.length > 0">
                    请假({{currentDayData.leave_attendance_list?.list?.length || 0}})
                </view>
            </view>


            <!-- 部门出勤率 -->
            <view class="department-stats"
                v-if="currentDayData?.department_list?.length > 0 && Number(currentDayData?.attendance_data?.should_attendance_num) > 0">
                <view v-for="(item,index) in currentDayData?.department_list" :key="index">
                    <view class="fs-28 m-b-20 flex flex-between">
                        <view class="fc6">
                            部门出勤率
                        </view>
                        <view class="fc6" style="margin-left: 200rpx;">
                            出勤人数
                        </view>
                        <view class="fc6">
                            平均工时
                        </view>
                    </view>
                    <view class="flex flex-between flex-a-center m-b-20">
                        <view class="flex flex-a-center">
                            <text class="primary m-r-20">{{index+1>9?index+1:'0' + (index+1)}}</text>
                            <text class="fs-28"> {{item.department_name || ''}}</text>
                        </view>
                        <view class="flex flex-1 flex-a-center m-l-20">
                            <view class="progress-bar flex-1">
                                <view class="progress-inner"
                                    :style="{width:`calc(100% * (${item?.attendance_data?.attendance_num || 0} / ${item?.attendance_data?.should_attendance_num || 0})`}">
                                </view>
                            </view>

                        </view>
                        <view class="fs-28 fc6" style="margin-right: 56rpx;margin-left: 100rpx;">
                            {{item?.attendance_data?.attendance_num ||
                            0}}/{{item?.attendance_data?.should_attendance_num || 0}}
                        </view>
                        <view class="fs-28 fc6">
                            {{Number(item?.attendance_data?.average_work_hours || 0)}}小时
                        </view>
                    </view>
                </view>
            </view>
        </template>


        <!-- 统计时间 -->
        <view class="fs-24 fc9 m-t-40" v-if="!judgeEmpty.showEmpty">
            统计截至 {{ currentTime }}
        </view>


        <!-- 空数据 -->
        <oa-empty :content="judgeEmpty.emptyText" :descriptionMarginTop="judgeEmpty?.descriptionMarginTop || '50rpx'"
            :imgWidth="judgeEmpty?.imgWidth || '410rpx'" :imgHeight="judgeEmpty?.imgHeight || '253rpx'"
            :imageUrl="judgeEmpty?.emptyImg || $tools.getOSSImageUrl('empty.png')" paddingBottom="50rpx"
            v-if="judgeEmpty.showEmpty"></oa-empty>

        <!-- 异常处理弹窗 -->
        <ApplicationPop v-model:visible="showApplicationPop" @select="handleSelect" />
    </view>
</template>

<script setup>
    import dayjs from 'dayjs'
    import CustomProgress from './CustomProgress.vue'
    import ApplicationPop from './ApplicationPop.vue'
    import { useUserStore } from '@/store/index'
    import { useStatisticsStore } from '@/store/index'

    // 获取统计状态管理
    const statisticsStore = useStatisticsStore()
    // 获取用户状态管理
    const userStore = useUserStore()

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
    const emit = defineEmits(['getUserInfo'])

    // 组件状态
    const loading = ref(true) // 加载状态
    const selectedDate = ref(dayjs().format('YYYY-MM-DD')) // 选中的日期
    const weekDays = ['一', '二', '三', '四', '五', '六', '日'] // 星期表头
    const isShowMore = ref(false) // 是否展开显示完整月份
    const swiperCurrent = ref(6) // 当前显示的swiper索引
    const swiperMonths = ref([]) // 存储月份数据
    const showApplicationPop = ref(false) // 是否显示异常处理弹窗
    const isMorning = ref(false) // 是否是早上

    const showProgress = ref(true) // 是否显示进度


    // 微信程序渲染问题
    // #ifdef MP-WEIXIN
    // #endif
    watch(isShowMore, (newVal) => {
        showProgress.value = false
        setTimeout(() => {
            showProgress.value = true
        }, 300)
    })


    // 用户信息
    const userInfo = computed(() => {
        return userStore?.userInfo?.admin_info || {}
    })

    // 计算属性
    /**
     * 当前时间
     * @returns {String} 格式化的当前时间
     */
    const currentTime = computed(() => {
        return dayjs().format('YYYY-MM-DD HH:mm')
    })

    // 计算进度值
    const progressValue = computed(() => {

        if (Number(currentDayData.value?.attendance_data?.should_attendance_num) == 0 || Number(currentDayData.value?.attendance_data?.attendance_num) == 0) {
            return 0
        }

        let num = (Number(currentDayData.value?.attendance_data?.attendance_num) / Number(currentDayData.value?.attendance_data?.should_attendance_num)) * 100
        return num.toFixed(2)
    })

    /**
     * 当前年份
     * @returns {String} 选中日期的年份
     */
    const currentYear = computed(() => {
        return dayjs(selectedDate.value).format('YYYY')
    })

    /**
     * 当前日期
     * @returns {String} 选中日期的月日
     */
    const currentDate = computed(() => {
        return dayjs(selectedDate.value).format('MM.DD')
    })

    /**
     * 当前日期完整格式
     * @returns {String} 选中日期的完整格式
     */
    const currentDateLine = computed(() => {
        return dayjs(selectedDate.value).format('YYYY-MM-DD')
    })

    /**
     * swiper高度
     * @returns {Number} 根据当前月份行数计算的高度
     */
    const swiperHeight = computed(() => {
        return swiperMonths.value[swiperCurrent.value]?.length * 100 + 140
    })

    // 当前行索引
    const currentRowIndex = computed(() => {
        let rowIndex = -1
        swiperMonths.value?.[swiperCurrent.value]?.forEach((e, index) => {
            e.forEach((day) => {
                if (day.date == selectedDate.value) {
                    rowIndex = index
                }
            })
        })

        return rowIndex
    })

    // 当前列索引
    const currentColumnIndex = computed(() => {
        let columnIndex = -1
        swiperMonths.value?.[swiperCurrent.value]?.[currentRowIndex.value]?.forEach((e, index) => {
            if (e.date == selectedDate.value) {
                columnIndex = index
            }
        })

        return columnIndex
    })

    // 当前日期数据
    const currentDayData = computed(() => {
        return swiperMonths.value?.[swiperCurrent.value]?.[currentRowIndex.value]?.[currentColumnIndex.value] || {}
    })



    // 是否休息
    const isRest = computed(() => {
        console.log('currentDayData.value?.punch_out_time_data?.time',currentDayData.value?.punch_out_time_data?.time)

        return currentDayData.value?.is_rest == 1 && !currentDayData.value?.punch_in_time_data?.time && !currentDayData.value?.punch_out_time_data?.time 
    })


    // 是否显示空数据
    const judgeEmpty = computed(() => {
        if (props.statisticType == 'personal') {
            if (isRest.value) {
                return {
                    showEmpty: true,
                    emptyText: '好好休息',
                    emptyImg: uni.$tools.getOSSImageUrl('empty_rest.png'),
                    imgWidth: '400rpx',
                    imgHeight: '400rpx',
                    descriptionMarginTop: '-20rpx'
                }
            }

            if (currentDayData.value?.is_show_no_click == 1) {
                return {
                    showEmpty: true,
                    emptyText: '当天没有打卡记录'
                }
            }


        } else {
            // 如果是今天以后的数据则 为true        
            if (dayjs(selectedDate.value).isAfter(dayjs().format('YYYY-MM-DD'))) {
                return {
                    showEmpty: true,
                    emptyText: '暂无统计结果'
                }
            }
        }


        return {
            showEmpty: false,
            emptyText: ''
        }
    })



    // 日期范围限制（改为一年）
    const dateRange = computed(() => {
        const today = dayjs()
        return {
            min: today.subtract(6, 'month').startOf('month'), // 半年前
            max: today.add(6, 'month').endOf('month') // 半年后
        }
    })

    // 检查日期是否超出范围
    const isDateDisabled = (date) => {
        const targetDate = dayjs(date)
        return targetDate.isBefore(dateRange.value.min) ||
            targetDate.isAfter(dateRange.value.max)
    }

    // 判断是否是今天
    const isToday = (date) => {
        return dayjs(date).format('YYYY-MM-DD') === dayjs().format('YYYY-MM-DD')
    }

    // 处理轮播切换
    const handleSwiperChange = (e) => {
        const {
            current
        } = e.detail

        let isChange = true
        swiperMonths.value[current].forEach(e => {
            e.forEach(x => {
                // 不在当前月份
                if (x.date == selectedDate.value && x.isCurrentMonth) {
                    isChange = false
                    return
                }
            })

        })

        if (isChange) {
            const newDate = dayjs(swiperMonths.value[current][2][0].date)
            selectedDate.value = newDate.startOf('month').format('YYYY-MM-01')
        }

        swiperCurrent.value = current

        getAttendanceDataByMonth()
    }



    // 回到今天
    const backToToday = () => {
        selectedDate.value = dayjs().format('YYYY-MM-DD')
        swiperCurrent.value = 6
    }

    // 选择日期
    const selectDate = (day) => {
        if (isDateDisabled(day.date)) {
            uni.showToast({
                title: '超出可选日期范围',
                icon: 'none'
            })
            return
        }

        if (!day.isCurrentMonth) {
            if (dayjs(day.date).date() > 15) {
                swiperCurrent.value -= 1
            } else {
                swiperCurrent.value += 1
            }

        }
        selectedDate.value = day.date

    }

    // 获取当月的考勤详情
    const getAttendanceDataByMonth = () => {
        let url = props.statisticType == 'personal' ? uni.$urls.statistics.getAttendanceDataByMonth : uni.$urls.statistics.getTeamAttendanceDataByMonth
        let postData = {
            date: selectedDate.value,
            relation_admin_id: props.statisticType == 'personal' ? props.relationAdminId : ''
        }
        uni.$doHttp
            .post(url, postData, { load: false })
            .then((res) => {
                if (res?.list.length > 0) {
                    swiperMonths.value?.[swiperCurrent.value]?.forEach(e => {
                        e.forEach(x => {
                            res.list.forEach(item => {
                                if (item.date == x.date) {
                                    for (let key in item) {
                                        if (item.hasOwnProperty(key)) {
                                            x[key] = item[key];
                                        }
                                    }
                                }
                            })
                        })
                    })
                }

                // 如果是个人统计 并且有关系人id 并且有用户信息 则抛出用户信息
                if (props.statisticType == 'personal' && res.user_info) {
                    emit('getUserInfo', res.user_info)
                }

            })
    }


    // 处理异常处理
    const handleSelect = (type) => {
        let time = 0
        if (isMorning.value) {
            time = dayjs(selectedDate.value).hour(9).minute(0).second(0).unix()
        } else {
            // 如果是下午缺卡 则默认18点
            time = dayjs(selectedDate.value).hour(18).minute(0).second(0).unix()
        }

        switch (type) {
            // 补卡申请
            case 'makeup':
                // 如果是早上缺卡 则默认9点

                uni.navigateTo({
                    url: `/pagesApply/makeupPunch/apply?clock_in_id=${currentDayData.value?.clock_in_id}&type=${isMorning.value ? 1 : 2}&time=${time}`
                })
                break
            // 请假审批单申请
            case 'leave':
                uni.navigateTo({
                    url: `/pagesApply/takeLeave/apply?time=${time}`
                })
                break
        }
    }

    // 处理异常处理
    const errorHandle = (type) => {
        isMorning.value = type === 'morning'
        showApplicationPop.value = true
    }

    // 跳转打卡详情
    const toClickInDetail = () => {
        uni.setStorageSync('currentDayData', currentDayData.value)
        uni.navigateTo({
            url: `/pagesApply/statistics/clickInDetail?selectedDate=${selectedDate.value}`
        })
    }

    // 跳转补卡申请详情
    const goOvertimeRequestDetail = (item) => {
        //1-补卡 2-请假
        if (item.request_type == 1) {
            uni.navigateTo({
                url: `/pagesApply/makeupPunch/detail?id=${item?.overtime_request_id}`
            })
        } else {
            uni.navigateTo({
                url: `/pagesApply/takeLeave/detail?id=${item?.overtime_request_id}`
            })
        }
    }
    // 跳转休息列表
    const goRestList = (type) => {
        if (type == 'rest') {
            uni.setStorageSync('restList', currentDayData.value.rest_attendance_list?.list)
        }
        uni.navigateTo({
            url: `/pagesApply/statistics/restList?type=${type}&selectedDate=${selectedDate.value}`
        })
    }

    // 跳转迟到列表
    const goLateList = () => {
        if (Number(currentDayData.value?.attendance_data?.late_num) > 0) {
            uni.setStorageSync('currentDayData', currentDayData.value)
            uni.navigateTo({
                url: `/pagesApply/statistics/clickInDetail?selectedDate=${selectedDate.value}`
            })
        } else {
            uni.$u.toast('暂无迟到记录')
        }
    }

    // 跳转未打卡列表
    const goAbsenteeismList = () => {
        if (Number(currentDayData.value?.attendance_data?.absenteeism_num) > 0) {
            uni.setStorageSync('currentDayData', currentDayData.value)
            uni.navigateTo({
                url: `/pagesApply/statistics/clickInDetail?selectedDate=${selectedDate.value}&tabIndex=1`
            })
        } else {
            uni.$u.toast('暂无未打卡记录')
        }
    }

    // ------------------------数据生成------------------------
    // 生成指定月份的日历数据
    const generateMonthCalendar = (dateStr) => {
        const date = dayjs(dateStr)
        const firstDay = date.startOf('month')
        const lastDay = date.endOf('month')
        const days = []
        let week = []

        // 填充第一周的前置空白天数
        const firstDayWeekday = firstDay.day() || 7
        for (let i = 1; i < firstDayWeekday; i++) {
            const prevDate = firstDay.subtract(firstDayWeekday - i, 'day')
            week.push({
                date: prevDate.format('YYYY-MM-DD'),
                dayNumber: prevDate.date(),
                isCurrentMonth: false,
                isToday: prevDate.format('YYYY-MM-DD') === dayjs().format('YYYY-MM-DD'),
            })
        }

        // 填充当月天数
        for (let i = 1; i <= lastDay.date(); i++) {
            const currentDate = date.date(i)
            week.push({
                date: currentDate.format('YYYY-MM-DD'),
                dayNumber: i,
                isCurrentMonth: true,
                isToday: currentDate.format('YYYY-MM-DD') === dayjs().format('YYYY-MM-DD'),
            })

            if (week.length === 7) {
                days.push(week)
                week = []
            }
        }

        // 填充最后一周的后置空白天数
        if (week.length > 0) {
            const lastWeekday = lastDay.day() || 7
            for (let i = 1; i <= 7 - lastWeekday; i++) {
                const nextDate = lastDay.add(i, 'day')
                week.push({
                    date: nextDate.format('YYYY-MM-DD'),
                    dayNumber: nextDate.date(),
                    isCurrentMonth: false,
                    isToday: false,
                })
            }
            days.push(week)
        }

        return days
    }


    // 初始化轮播数据
    const initSwiperMonths = () => {
        const currentMonth = dayjs(selectedDate.value)
        swiperMonths.value = [
            generateMonthCalendar(currentMonth.subtract(6, 'month')),
            generateMonthCalendar(currentMonth.subtract(5, 'month')),
            generateMonthCalendar(currentMonth.subtract(4, 'month')),
            generateMonthCalendar(currentMonth.subtract(3, 'month')),
            generateMonthCalendar(currentMonth.subtract(2, 'month')),
            generateMonthCalendar(currentMonth.subtract(1, 'month')),
            generateMonthCalendar(currentMonth),
            generateMonthCalendar(currentMonth.add(1, 'month')),
            generateMonthCalendar(currentMonth.add(2, 'month')),
            generateMonthCalendar(currentMonth.add(3, 'month')),
            generateMonthCalendar(currentMonth.add(4, 'month')),
            generateMonthCalendar(currentMonth.add(5, 'month')),
            generateMonthCalendar(currentMonth.add(6, 'month')),
        ]

        setTimeout(() => {
            loading.value = false
        }, 10)
    }

    // 初始化
    initSwiperMonths()

    // 设置选中日期
    const setSelectedDate = (date) => {
        if (!date) return

        nextTick(() => {
            selectedDate.value = date
            const currentMonthIndex = swiperMonths.value.findIndex(e => e.some(x => x.some(y => y.date == date && y.isCurrentMonth)))

            if (currentMonthIndex == -1) {
                uni.showToast({
                    title: '超出可选日期范围',
                    icon: 'none'
                })
                return
            }

            swiperCurrent.value = currentMonthIndex
            getAttendanceDataByMonth()
        })
    }


    onMounted(() => {
        getAttendanceDataByMonth()
    })



    // 抛出
    defineExpose({
        setSelectedDate
    });
</script>

<style lang="scss" scoped>
    .calendar-wrap {

        // 添加日历内容区域样式
        .calendar-content {
            position: relative;
            touch-action: pan-y pinch-zoom; // 优化触摸体验
            user-select: none; // 防止文本选中
        }

        .week-header {
            .week-item {
                flex: 1;
                text-align: center;
            }
        }

        .days-grid {
            .grid-row {

                /* margin-bottom: 30rpx; */
                &:last-child {
                    margin-bottom: 0;
                }
            }

            .grid-item {
                flex: 1;
                height: 80rpx;

                .day-number {
                    width: 60rpx;
                    height: 60rpx;
                    line-height: 60rpx;
                    text-align: center;
                    font-size: 30rpx;
                    color: #333;
                    border-radius: 50%;


                    &.other-month {
                        color: #ccc;
                        cursor: pointer;
                    }

                    &.isToday {
                        color: #0089ff;
                        font-weight: bold;
                        background-color: rgba(0, 137, 255, 0.1);
                    }

                    &.current {
                        background-color: #0089ff;
                        color: #fff;
                        font-weight: bold;
                    }

                    &.disabled {
                        color: #ccc;
                        cursor: not-allowed;
                        pointer-events: none;
                    }
                }

                .status-dot {
                    width: 8rpx;
                    height: 8rpx;
                    background-color: #0089ff;
                    border-radius: 50%;
                    margin-top: 8rpx;
                }

                .status-dots {
                    margin-top: 4rpx;
                    gap: 4rpx;


                }
            }
        }

        .dot {
            width: 8rpx;
            height: 8rpx;
            border-radius: 50%;

            &.normal {
                background-color: #0089ff;
            }

            &.warning {
                background-color: #ff9900;
            }

            &.tip {
                background-color: #666;
            }
        }

        .personal-card {
            padding: 20rpx;
            border: 2rpx solid #f5f5f5;
            border-radius: 10rpx;
        }

        .time-detail {
            .line-step {
                background-color: #CDD1D4;
                height: 90%;
                top: calc(50% + 14rpx);
                left: 4rpx;
                transform: translateY(-50%);
            }

            .circle-icon {
                background-color: #CDD1D4;
                border-radius: 50%;
            }

            .box-card {
                display: flex;
                align-items: center;
                font-size: 18rpx;
                padding: 2rpx 10rpx;
                border-radius: 8rpx;

                &.box-q-card {
                    color: #ff9900;
                    border: 2rpx solid #ff9900;
                }

                &.box-bk-card {
                    color: #0089ff;
                    border: 2rpx solid #0089ff;
                }
            }
        }
    }

    .calendar-swiper {
        width: 100%;
        transition: all 0.3s ease;
    }

    .progress-text {
        position: absolute;
        bottom: 200rpx;
    }

    .progress-bar {
        height: 12rpx;
        background-color: #f5f5f5;
        border-radius: 6rpx;
        overflow: hidden;

        .progress-inner {
            height: 100%;
            background-color: #2979ff;
            border-radius: 6rpx;
        }
    }

    .primary {
        color: #2979ff;
    }

    .error-btn {
        width: 200rpx;
        color: #333333;
        border: 2rpx solid #f5f5f5;
        border-radius: 8rpx;
        padding: 4rpx 10rpx;
        font-size: 28rpx;
    }
</style>