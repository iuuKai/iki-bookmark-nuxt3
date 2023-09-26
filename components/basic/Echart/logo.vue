<template>
	<div class="h-full" ref="echartRef"></div>
</template>

<script setup lang="ts">
import * as echarts from 'echarts/core'
import { GraphicComponent, GraphicComponentOption } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import type { ComposeOption } from 'echarts/core'

type EChartsOption = ComposeOption<GraphicComponentOption>

echarts.use([GraphicComponent, CanvasRenderer])

const props = defineProps({
	title: {
		type: String,
		default: ''
	},
	loop: {
		type: Boolean,
		default: false
	},
	fontSize: {
		type: Number,
		default: 16
	},
	duration: {
		type: Number,
		default: 3000
	}
})

let echart: any | null
const echartRef = ref()
const option = ref<EChartsOption>({})

onMounted(() => {
	initChart()
	window.addEventListener('resize', resizeChart)
})
onUnmounted(() => {
	window.removeEventListener('resize', resizeChart)
})

const logoOption = ({
	title,
	fontSize,
	loop,
	duration
}: {
	title: string
	fontSize: number
	loop: boolean
	duration: number
}) => ({
	graphic: {
		elements: [
			{
				type: 'text',
				left: 'center',
				top: 'center',
				style: {
					text: title,
					fontSize,
					fontWeight: 'bold',
					lineDash: [0, 200],
					lineDashOffset: 0,
					fill: 'transparent',
					stroke: '#6366f1',
					lineWidth: 1
				},
				keyframeAnimation: {
					duration,
					loop,
					keyframes: [
						{
							percent: 0.7,
							style: {
								fill: 'transparent',
								lineDashOffset: 200,
								lineDash: [200, 0]
							}
						},
						{
							// Stop for a while.
							percent: 0.8,
							style: {
								fill: 'transparent'
							}
						},
						{
							percent: 1,
							style: {
								fill: '#6366f1'
							}
						}
					]
				}
			}
		]
	}
})

const initChart = () => {
	if (process.server) return
	initChartData()
	if (!echart) echart = echarts.init(unrefElement(echartRef))
	echart.setOption(option.value)
}

const initChartData = () => {
	const { title, fontSize, loop, duration } = props
	if (!title) return
	option.value = logoOption({ title, fontSize, loop, duration })
}

const resizeChart = () => {
	if (echart) echart.resize()
}

defineExpose({
	resizeChart
})
</script>

<style scoped lang="less"></style>
