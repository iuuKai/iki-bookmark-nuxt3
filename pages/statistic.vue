<!--
 * @Author: iuukai
 * @Date: 2023-08-14 02:06:13
 * @LastEditors: iuukai
 * @LastEditTime: 2023-09-17 23:19:56
 * @FilePath: \iki-bookmark-nuxt3\pages\statistic.vue
 * @Description: 
 * @QQ/微信: 790331286
-->
<template>
	<div>
		<div>分类占比、日期新增、日期总数</div>
		<el-button @click="demo">click</el-button>
		<div>{{ websiteStatisticLine }}</div>
		<!-- <el-card body-class="h-36 xl:h-[30rem] lg:h-80 md:h-52"> -->
		<!-- <BasicEchartPie
				v-if="!isEmpty(websiteStatisticPie)"
				:data="websiteStatisticPie"
				title="书签分类"
			/> -->
		<!-- </el-card> -->

		<div class="h-80">
			<BasicEchart
				v-if="!isEmpty(websiteStatisticPie)"
				:data="websiteStatisticLine"
				title="书签分类"
			/>
		</div>
	</div>
</template>

<script setup lang="ts">
import { useRepoStore } from '@/store/modules/repo'

definePageMeta({ middleware: ['a-need-login', 'b-need-repo'] })

const repoStore = useRepoStore()

const loading = ref(false)

// 记录获取数据的文件 path
const path = ref<string>('')
const data = computed<any[]>(() => (path.value ? repoStore.dataJSON[path.value] : []))

const websiteStatisticPie = computed(() =>
	data.value.map(({ category, list }: any) => ({ name: category, value: list.length }))
)
const websiteStatisticLine = computed(() =>
	data.value.map(({ category, list }: any) => ({ name: category, value: list.length }))
)

const demo = () => {
	console.log(data.value)
}

initData()
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

<style scoped lang="less"></style>
