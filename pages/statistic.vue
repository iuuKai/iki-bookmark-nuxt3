<!--
 * @Author: iuukai
 * @Date: 2023-08-14 06:20:12
 * @LastEditors: iuukai
 * @LastEditTime: 2023-09-30 10:36:25
 * @FilePath: \iki-bookmark-nuxt3\pages\statistic.vue
 * @Description: 
 * @QQ/微信: 790331286
-->
<template>
	<div class="bm-statistic">
		<Skeleton type="D" :loading="loading">
			<!-- <div>分类占比、日期新增、数量变化、近期新增、分类增删趋势、近期新增最多、近期删除最多</div> -->
			<CommonEmpty v-if="isEmpty(data)" />
			<div v-else class="grid grid-cols-1 gap-y-10">
				<el-card body-class="!p-2 h-52">
					<ClientOnly>
						<BasicEchart type="heatmapChart" :chart-data="websiteStatisticHeatmapData" />
					</ClientOnly>
				</el-card>
				<el-carousel
					:autoplay="!isEnter"
					:interval="4000"
					type="card"
					indicator-position="none"
					@mouseenter="isEnter = true"
					@mouseleave="isEnter = false"
					@change="curCarouselIndex = $event"
				>
					<el-carousel-item v-for="(item, i) in carouselList" :key="i">
						<ClientOnly>
							<div class="bm-carousel-echart">
								<BasicEchart :type="item.type" :chart-data="item.chartData" />
								<div v-show="curCarouselIndex !== i" class="bm-mask"></div>
							</div>
						</ClientOnly>
					</el-carousel-item>
				</el-carousel>
			</div>
		</Skeleton>
	</div>
</template>

<script setup lang="ts">
import { useRepoStore } from '@/store/modules/repo'

definePageMeta({ middleware: ['a-need-login', 'b-need-repo'] })

const repoStore = useRepoStore()

const isEnter = ref(false)
const loading = ref(false)
const curCarouselIndex = ref(0)

// 记录获取数据的文件 path
const path = ref<string>('')
const data = computed<any[]>(() => (path.value ? repoStore.dataJSON[path.value] : []))
// const flat = computed<any[]>(() => (path.value ? repoStore.flatDataJSON[path.value] : []))
const configLog = computed<any>(() => (path.value && repoStore.CONFIG.log?.[path.value]) ?? {})

// 日历
const websiteStatisticHeatmapData = computed(() => {
	const title: string = '书签新增日历'
	const xData: string[] = []
	const data = Object.keys(configLog.value).map(date => [date, configLog.value[date].add])
	const series = {
		type: 'heatmap',
		coordinateSystem: 'calendar',
		calendarIndex: 0,
		data
	}
	return { title, xData, series }
})

// 饼图
const websiteStatisticPieData = computed(() => {
	const title: string = '书签分类占比'
	const xData: string[] = []
	const series = [
		{
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
			data: data.value.map(({ category, list }: any) => {
				xData.push(category)
				return { name: category, value: list.length }
			})
		}
	]
	return { title, xData, series }
})

// 柱状图
const websiteStatisticBarData = computed(() => {
	const title: string = '书签增删对比'
	const xData: string[] = []
	const series = Object.keys(configLog.value)
		.sort()
		.slice(-7)
		.reduce((res: any[], cur) => {
			const { total, add, del } = configLog.value[cur]
			xData.push(cur)
			if (isEmpty(res)) {
				res.push({
					name: '新增',
					data: [add],
					type: 'bar',
					barGap: 0
				})
				res.push({
					name: '删除',
					data: [del],
					type: 'bar',
					itemStyle: {
						color: '#EE6666'
					}
				})
				res.push({
					name: '总数',
					data: [total],
					type: 'line'
				})
			} else {
				res[0].data.push(add)
				res[1].data.push(del)
				res[2].data.push(total)
			}
			return res
		}, [])
	return { title, xData, series }
})

// 词云
const websiteStatisticWordrData = computed(() => {
	const title: string = '书签分类云'
	const xData: string[] = []
	const series = [
		{
			type: 'wordCloud',
			left: 0,
			top: 0,
			width: '100%',
			height: '100%',
			sizeRange: [14, 50],
			rotationRange: [0, 0],
			gridSize: 20,
			layoutAnimation: true,
			textStyle: {
				color() {
					const colors = [
						'#94a3b8',
						'#ef4444',
						'#2dd4bf',
						'#0ea5e9',
						'#c084fc',
						'#9e87ff',
						'#f472b6',
						'#fe9a8b',
						'#fdba74',
						'#0891b2',
						'#58D5FF'
					]
					return colors[Math.floor(Math.random() * 11)]
				}
			},
			// 渲染词典数据
			data: data.value.map(({ category, list }: any) => {
				xData.push(category)
				return { name: category, value: list.length }
			})
		}
	]
	return { title, xData, series }
})

const carouselList = computed(() => [
	{ type: 'pieChart', chartData: websiteStatisticPieData.value },
	{ type: 'barChart', chartData: websiteStatisticBarData.value },
	{ type: 'wordCloudChart', chartData: websiteStatisticWordrData.value }
])

onBeforeMount(() => {
	initData()
})

async function initData() {
	try {
		loading.value = true
		const res: any = await repoStore.apiGetWebsiteData(true)
		// 延迟 500ms 避免直接跳过 loading（因为有做缓存，会跳过请求）
		await new Promise(resolve => setTimeout(resolve, 500))
		path.value = res
	} finally {
		loading.value = false
	}
}
</script>

<style scoped lang="less">
.bm-statistic {
	@apply relative h-full;

	.bm-carousel-echart {
		@apply relative h-full bg-white rounded-lg shadow-md overflow-hidden;

		.bm-mask {
			@apply absolute w-full h-full top-0 left-0 rounded-lg bg-black/50 backdrop-blur-sm;
		}
	}
}
</style>
