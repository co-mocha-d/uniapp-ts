/**
 * @Description: 统计模块配置文件
 * @Author: daidian
 * @createTime: 2025-02-19 13:36:18
 */

/**
 * 个人统计导航列表配置
 * @description 定义个人统计页面的时间维度选项
 * @type {Array<Object>}
 * @property {string} name - 显示名称
 * @property {string} key - 唯一标识
 */
export const navListPersonal = [{
		name: '日',
		key: 'day'
	},
	{
		name: '周',
		key: 'week'
	},
	{
		name: '月',
		key: 'month'
	}
];

/**
 * 团队统计导航列表配置
 * @description 定义团队统计页面的时间维度选项
 * @type {Array<Object>}
 * @property {string} name - 显示名称
 * @property {string} key - 唯一标识
 */
export const navListTeam = [{
		name: '日统计',
		key: 'day'
	},
	{
		name: '周统计',
		key: 'week'
	},
	{
		name: '月统计',
		key: 'month'
	}
];

/**
 * 主页面tab切换配置
 * @description 定义统计主页面的团队/个人维度切换选项
 * @type {Array<Object>}
 * @property {string} name - 显示名称
 */
export const mainTabs = [{
		name: '团队统计'
	},
	{
		name: '我的统计'
	}
]