/*
 * @Author: iuukai
 * @Date: 2023-09-20 12:20:20
 * @LastEditors: iuukai
 * @LastEditTime: 2023-09-26 17:50:25
 * @FilePath: \iki-bookmark-nuxt3\components\basic\Echart\option.map.ts
 * @Description:
 * @QQ/微信: 790331286
 */
import { dayjs } from 'element-plus'
import * as echarts from 'echarts/core'
import { BarChart, LineChart, HeatmapChart, PieChart } from 'echarts/charts'
import {
	TitleComponent,
	TooltipComponent,
	GridComponent,
	VisualMapComponent,
	CalendarComponent,
	LegendComponent,
	GraphicComponent,
	GraphicComponentOption
} from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import type { ComposeOption } from 'echarts/core'
import type {
	BarSeriesOption,
	LineSeriesOption,
	HeatmapSeriesOption,
	PieSeriesOption
} from 'echarts/charts'
import type {
	TitleComponentOption,
	TooltipComponentOption,
	GridComponentOption,
	VisualMapComponentOption,
	CalendarComponentOption,
	LegendComponentOption
} from 'echarts/components'

export type EChartsOption = ComposeOption<
	| TitleComponentOption
	| TooltipComponentOption
	| GridComponentOption
	| BarSeriesOption
	| LineSeriesOption
	| VisualMapComponentOption
	| CalendarComponentOption
	| HeatmapSeriesOption
	| LegendComponentOption
	| PieSeriesOption
	| GraphicComponentOption
>

interface OptionMap {
	title: string
	xData: string[]
	series: BarSeriesOption | LineSeriesOption
}

echarts.use([
	TitleComponent,
	TooltipComponent,
	GridComponent,
	BarChart,
	LineChart,
	CanvasRenderer,
	VisualMapComponent,
	CalendarComponent,
	HeatmapChart,
	LegendComponent,
	PieChart,
	GraphicComponent
])

// 柱状图
export const barOption = ({ title, xData, series }: OptionMap): EChartsOption => ({
	title: {
		top: 0,
		left: 'left',
		text: title,
		textStyle: {
			color: '#3C4858'
		}
	},
	legend: {
		top: 10,
		right: 10
	},
	tooltip: {
		trigger: 'item'
	},
	xAxis: {
		type: 'category',
		axisLabel: { interval: 0, rotate: 45 },
		data: xData
	},
	yAxis: {
		type: 'value',
		axisLine: {
			show: true,
			lineStyle: {
				width: 1
			}
		}
	},
	series
})

// 日历
export const heatmapOption = ({ title, xData, series }: OptionMap): EChartsOption => {
	const start = dayjs().subtract(1, 'year').format('YYYY-MM-DD')
	const end = dayjs().format('YYYY-MM-DD')
	return {
		title: {
			top: 0,
			left: 'left',
			text: title,
			textStyle: {
				color: '#3C4858'
			}
		},
		tooltip: {
			padding: 10,
			backgroundColor: '#555',
			borderWidth: 0,
			formatter(obj: any) {
				const value = obj.value
				return `${value[1]} 个新增: ${value[0]}`
			},
			textStyle: {
				fontSize: 12,
				color: '#FFF'
			}
		},
		visualMap: {
			min: 0,
			max: 10,
			show: true,
			showLabel: true,
			calculable: true,
			// categories: [0, 1, 2, 3, 4],
			// itemWidth: 20,
			// itemHeight: 10,
			orient: 'horizontal',
			left: 'right',
			top: 0,
			// bottom: 0,
			inRange: {
				symbol: 'rect',
				color: ['#EBEDF0', '#C6E48B', '#7BC96F', '#239A3B', '#196127']
			}
		},
		calendar: {
			left: 'center',
			bottom: 0,
			range: [start, end],
			cellSize: [18, 18],
			splitLine: {
				show: false
			},
			itemStyle: {
				color: '#EEE',
				borderColor: '#FFF',
				borderWidth: 2
			},
			yearLabel: {
				show: false
			},
			monthLabel: {
				nameMap: 'cn',
				fontWeight: 'lighter',
				fontSize: 12
			},
			dayLabel: {
				show: true,
				fontWeight: 'lighter',
				fontSize: 12,
				nameMap: ['周日', '', '', '周三', '', '', '周六']
			}
		},
		series
	}
}

// 折线图
export const lineOption = ({ title, xData, series }: OptionMap): EChartsOption => ({
	title: {
		top: 0,
		left: 'left',
		text: title,
		textStyle: {
			color: '#3C4858'
		}
	},
	tooltip: {
		trigger: 'item'
	},
	xAxis: {
		type: 'category',
		data: xData
	},
	yAxis: {
		type: 'value',
		axisLine: {
			show: true,
			lineStyle: {
				width: 1
			}
		}
	},
	series
})

// 饼图
export const pieOption = ({ title, xData, series }: OptionMap): EChartsOption => ({
	title: {
		text: title,
		left: 'left'
	},
	tooltip: {
		trigger: 'item'
	},
	legend: {
		type: 'scroll',
		orient: 'vertical',
		right: 10,
		top: 10,
		bottom: 20,
		data: xData
	},
	series
})

// 图形
export const groupOption = ({}: OptionMap): EChartsOption => ({
	graphic: {
		elements: [
			{
				type: 'group',
				left: 'center',
				top: 'center',
				children: new Array(7).fill(0).map((val, i) => ({
					type: 'rect',
					x: i * 20,
					shape: {
						x: 0,
						y: -40,
						width: 10,
						height: 80
					},
					style: {
						fill: '#5470c6'
					},
					keyframeAnimation: {
						duration: 1000,
						delay: i * 200,
						loop: true,
						keyframes: [
							{
								percent: 0.5,
								scaleY: 0.3,
								easing: 'cubicIn'
							},
							{
								percent: 1,
								scaleY: 1,
								easing: 'cubicOut'
							}
						]
					}
				}))
			}
		]
	}
})

// 词云
export const wordCloudOption = ({ title, series }: OptionMap): EChartsOption => ({
	backgroundColor: '#fff',
	title: {
		top: 0,
		left: 'left',
		text: title,
		textStyle: {
			color: '#3C4858'
		}
	},
	tooltip: {
		trigger: 'item'
	},
	series
})

export { echarts }

export const init = echarts.init

export default {
	barChart: barOption,
	heatmapChart: heatmapOption,
	lineChart: lineOption,
	pieChart: pieOption,
	wordCloudChart: wordCloudOption,
	groupChart: groupOption
} as any
