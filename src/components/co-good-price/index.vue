<template>
	<view class="hd-money-box" :class="original ? 'hc-money-original' : ''":style="{ padding: padding, margin: margin, fontSize: size + 'rpx', color: color }">
		<!-- 显示人民币大写 -->
		<view v-if="rmb">
			<!-- 币种（人民币） -->
			<text class="hd-money-text" v-if="showUnit">{{ rmbUnit }}</text>
			<!-- 金额大写 -->
			<text class="hd-money-text">{{ rmbText }}</text>
		</view>
		
		<!-- 阿拉伯数组展示方式 -->
		<view v-else>
			<!-- 金额单位（通过showUnit属性以及是否展示在左侧（unitPosition=='left'）来控制显示、隐藏） -->
			<text class="hd-money-unit" :style="{'font-size': `${Number(size) * 0.8}rpx`}" v-if="showUnit && unitPosition=='left'">{{ unit }}</text>
			<!-- 金额整数 -->
			<text class="hd-money-text">{{ moneyData }}</text>
			<!-- 金额小数部分（可以通过showZeroDecimal属性来控制小数部分为0时，是否展示） -->
			<text class="hd-money-decimal" :style="{'font-size': `${Number(size) * 0.8}rpx`}" v-if="showZeroDecimal || decimalData!='00'">.{{ decimalData }}</text>
			<!-- 金额单位（元、美元、镑等） -->
			<text class="hd-money-unit" :style="{'font-size': `${Number(size) * 0.8}rpx`}" v-if="showUnit && unitPosition=='right'">{{ unitText }}</text>
		</view>
	</view>
</template>

<script>
export default {
	name: 'hcMoney',
	props: {
		// 金额数字
		money: {
			type: [Number, String],
			default: 0.0
		},
		//padding 内边距
		padding: {
			type: String,
			default: '0'
		},
		// margin 外边距
		margin: {
			type: String,
			default: '0'
		},
		//主体文字大小 rpx
		size: {
			type: Number,
			default: 28
		},
		// 文字颜色
		color: {
			type: String,
			default: '#FE1122'
		},
		// 金额单位
		unit: {
			type: String,
			default: '¥'
		},
		// 是否显示单位
		showUnit: {
			type: Boolean,
			default: true
		},
		// 单位显示位置 （left or right）
		unitPosition: {
			type: String,
			default: 'left'
		},
		// 小数为0时，是否显示小数位
		showZeroDecimal: {
			type: Boolean,
			default: false
		},
		// 是否显示千分位
		thousandth: {
			type: Boolean,
			default: false
		},
		// 是否显示删除线
		original: {
			type: Boolean,
			default: false
		},
		// 是否转换为人民币大写
		rmb: {
			type: Boolean,
			default: false
		}
	},
	data() {
		return {
			moneyData: '0',				//金额整数位
			decimalData: '00',			//金额小数位
			unitText: '元',				//单位
			rmbUnit: '人民币',			//币种
			rmbText: '',				//显示人名币大写
		};
	},
	watch: {
		// 监听金额变化
		money(val) {
			// 调用初始化处理金额
			this.splitMoney();
		},
		// 实时相应币种，显示单位
		unit(val){
			if('$'==val){
				this.rmbUnit = '美金';
				this.unitText = '美元';
			}else if('£'==val){
				this.rmbUnit = '英镑';
				this.unitText = '镑';
			}else if('€'==val){
				this.rmbUnit = '欧元';
				this.unitText = '欧';
			}else if('₩'==val){
				this.rmbUnit = '韩元';
				this.unitText = '韩元';
			}else{
				this.rmbUnit = '人民币';
				this.unitText = '元';
			}
		}
	},
	created() {
		// 调用初始化处理金额
		this.splitMoney();
	},
	methods: {
		// 初始化处理金额
		splitMoney: function() {
			var m = this.money;
			if (!m) {
				m = 0.0;
			}
			var p = parseFloat(m).toFixed(2).toString();
			// 将金额拆分为整数、小数两部分
			if (p.indexOf('.') > -1) {
				var pps = p.split('.');
				this.moneyData = pps[0];
				this.decimalData = pps[1];
			} else {
				this.moneyData = p;
				this.decimalData = '00';
			}
			// 控制显示千分位
			if(this.thousandth){
				this.moneyData = parseInt(this.moneyData).toLocaleString();
			}
			// 转为人民币大写
			if(this.rmb){
				this.toRmb();
			}
		},
		// 将金额转换为人民币大写
		toRmb: function(){
			const fraction = ['角', '分'];
			const digit = ['零', '壹', '贰', '叁', '肆', '伍', '陆', '柒', '捌', '玖'];
			const unit = [
				['圆', '万', '亿'],
				['', '拾', '佰', '仟'],
			];
			// 奖金转换为金额的绝对值
			let num = Math.abs(parseFloat(this.money));
			// 金额小数部分大写
			let s = '';
			// 通过自定义数组fraction、digit转换并取出金额小数部分大写、赋值给变量s
			fraction.forEach((item, index) => {
				s += (digit[Math.floor(num * 10 * (10 ** index)) % 10] + item).replace(/零./, '');
			});
			// 有则显示、为0时则小时【整】
			s = s || '整';
			// 金额整数部分
			num = Math.floor(num);
			// 通过自定义数组digit、unit转换并取出金额整数部分大写
			for (let i = 0; i < unit[0].length && num > 0; i += 1) {
				let p = '';
				for (let j = 0; j < unit[1].length && num > 0; j += 1) {
					p = digit[num % 10] + unit[1][j] + p;
					num = Math.floor(num / 10);
				}
				s = p.replace(/(零.)*零$/, '').replace(/^$/, '零') + unit[0][i] + s;
			}
			// 最终得到金额完整大写
			this.rmbText = s.replace(/(零.)*零圆/, '圆').replace(/(零.)+/g, '零').replace(/^整$/, '零圆整');
		}
	}
};
</script>

<style lang="scss" scoped>
	// 引入自定义字体
	@font-face {
		font-family: 'moneyFont';
		/* src: url('./index.ttf') format('truetype'); */
		font-weight: normal;
		font-style: normal;
	}
	// 金额主体
	.hd-money-box {
		box-sizing: border-box;
		font-family: moneyFont, "Microsoft Yahei","Helvetica Neue",Helvetica,Arial,sans-serif;
		display: flex;
		align-items: flex-end;
		justify-items: flex-end;
		justify-content: flex-start;
		font-weight: 500;

		.hd-money-unit {
			margin: 0;
			padding: 0;
		}

		.hd-money-text {
			margin: 0;
			padding: 0;
		}

		.hd-money-decimal {
			margin: 0;
			padding: 0;
		}
	}
	
	.hc-money-original {
		text-decoration: line-through;
	}
</style>