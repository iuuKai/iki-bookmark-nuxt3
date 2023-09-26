<!--
 * @Author: iuukai
 * @Date: 2023-09-17 04:00:33
 * @LastEditors: iuukai
 * @LastEditTime: 2023-09-20 20:31:54
 * @FilePath: \iki-bookmark-nuxt3\components\basic\Echart\index.vue
 * @Description: 
 * @QQ/微信: 790331286
-->
<template>
	<div class="h-full" ref="echartRef"></div>
</template>

<script setup lang="ts">
import chartOptions, { init } from './option.map'
import type { EChartsOption } from './option.map'

const props = defineProps({
	type: {
		type: String as any,
		default: ''
	},
	chartData: {
		type: Object,
		default: () => ({})
	}
})

let echart: any | null
const echartRef = ref()
const option = ref<EChartsOption>({})

watch(option, (v: EChartsOption) => {
	if (isEmpty(v)) return
	initChart()
})

onMounted(async () => {
	initChartData()
	window.addEventListener('resize', resizeChart)
})
onUnmounted(() => {
	window.removeEventListener('resize', resizeChart)
})

const initChart = async () => {
	if (process.server) return
	if (props.type === 'wordCloudChart') {
		await import('echarts-wordcloud')
	}
	if (!echart) echart = init(unrefElement(echartRef))
	if (!isEmpty(option.value)) echart.setOption(option.value)
}

const initChartData = () => {
	const type = props.type
	const params = props.chartData
	if (type && chartOptions[type] && !isEmpty(props.chartData)) {
		option.value = chartOptions[type](params)
	}
}

const resizeChart = () => {
	if (echart) echart.resize()
}
</script>

<style scoped lang="less"></style>
