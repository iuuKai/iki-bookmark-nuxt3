<!--
 * @Author: iuukai
 * @Date: 2023-09-17 04:00:33
 * @LastEditors: iuukai
 * @LastEditTime: 2023-09-17 23:19:21
 * @FilePath: \iki-bookmark-nuxt3\components\basic\Echart\index.vue
 * @Description: 
 * @QQ/微信: 790331286
-->
<template>
	<div>
		<!-- 客户端组件 -->
		<ClientOnly fallback-tag="div" fallback="Loading comments...">
			<VChart class="chart" :option="option" autoresize />
		</ClientOnly>
	</div>
</template>

<script setup>
import { ref } from 'vue'

// 引入 vue-echarts 组件
import VChart, { THEME_KEY } from 'vue-echarts'

import { use } from 'echarts/core'
import { LineChart } from 'echarts/charts'
import { GridComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'

use([GridComponent, LineChart, CanvasRenderer])

// 设置黑暗模式主题
provide(THEME_KEY, 'dark')

// 图表数据
const option = ref({
	xAxis: {
		type: 'category',
		data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
	},
	yAxis: {
		type: 'value',
		axisLine: {
			show: true, //这里的show用于设置是否显示y轴那一条线 默认为true
			lineStyle: {
				//lineStyle里面写y轴那一条线的样式
				// color:'#6FC6F3',
				width: 1 //轴线的粗细 我写的是2 最小为0，值为0的时候线隐藏
			}
		}
	},
	series: [
		{
			data: [150, 230, 224, 218, 135, 147, 260],
			type: 'line'
		}
	]
})
</script>

<style scoped>
.chart {
	height: 100vh;
}
</style>
