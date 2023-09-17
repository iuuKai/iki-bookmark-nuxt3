<!--
 * @Author: iuukai
 * @Date: 2023-09-17 20:14:28
 * @LastEditors: iuukai
 * @LastEditTime: 2023-09-17 20:14:28
 * @FilePath: \iki-bookmark-nuxt3\components\basic\Echart\index copy.vue
 * @Description: 
 * @QQ/微信: 790331286
-->
<!--
 * @Author: iuukai
 * @Date: 2023-09-17 04:00:33
 * @LastEditors: iuukai
 * @LastEditTime: 2023-09-17 14:49:52
 * @FilePath: \iki-bookmark-nuxt3\components\basic\Echart\index.vue
 * @Description: 
 * @QQ/微信: 790331286
-->
<template>
	<div class="h-full" ref="echartRef"></div>
</template>

<script setup lang="ts">
import * as echarts from 'echarts'

const props = defineProps({
	chartData: {
		type: Object,
		default: () => ({
			xData: [],
			series: []
		})
	},
	data: {
		type: Array,
		default: () => []
	},
	title: {
		type: String,
		default: ''
	}
})

const echartRef = ref()
let echart: any | null
const option = computed(() => ({
	title: {
		text: props.title,
		left: 'left'
	},
	tooltip: {
		trigger: 'item',
		formatter: '{a} <br/>{b} : {c} ({d}%)'
	},
	legend: {
		type: 'scroll',
		orient: 'vertical',
		right: 50,
		top: 20,
		bottom: 20,
		data: props.data.map(({ name }: any) => name)
	},
	series: [
		{
			name: '书签分类',
			type: 'pie',
			radius: ['40%', '70%'],
			center: ['40%', '55%'],
			emphasis: {
				itemStyle: {
					shadowBlur: 10,
					shadowOffsetX: 0,
					shadowColor: 'rgba(0, 0, 0, 0.5)'
				}
			},
			data: props.data
		}
	]
}))

onMounted(() => {
	initChart()
	window.addEventListener('resize', resizeChart)
})
onUnmounted(() => {
	window.removeEventListener('resize', resizeChart)
})

const initChart = () => {
	if (process.server) return
	initChartData()
	if (!echart) echart = echarts.init(unrefElement(echartRef))
	echart.setOption(option.value)
}

const initChartData = () => {}

const resizeChart = () => {
	if (echart) echart.resize()
}

defineExpose({
	resizeChart
})
</script>

<style scoped lang="less"></style>
