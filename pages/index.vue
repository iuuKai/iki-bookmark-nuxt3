<!--
 * @Author: iuukai
 * @Date: 2023-08-06 12:24:38
 * @LastEditors: iuukai
 * @LastEditTime: 2023-09-12 23:55:53
 * @FilePath: \iki-bookmark-nuxt3\pages\index.vue
 * @Description: 
 * @QQ/微信: 790331286
-->
<template>
	<div>
		<ClientOnly>
			<template v-for="(item, i) in defaultMarks" :key="item.category">
				<div class="list">
					<div :class="['title my-4 font-bold', { 'mt-0': !i }]">{{ item.category }}</div>
					<div class="grid gap-3 2xl:grid-cols-4 xl:grid-cols-3 md:grid-cols-2 sm:grid-cols-1">
						<BasicWebsiteCard
							v-for="website in item.list"
							:key="website.id"
							:isStar="isStar(website.id)"
							:title="website.title"
							:url="website.url"
							:icon="website.icon"
							:description="website.description"
							:isLoading="isLoading"
							@star-change="handleClick(website)"
						/>
					</div>
				</div>
				<div class="bm-divider"></div>
			</template>
		</ClientOnly>
	</div>
</template>

<script setup lang="ts">
import defaultMarks from '@/assets/db/index.json'
import { getId } from '@/utils/custom-function'
import { useRepoStore } from '@/store/modules/repo'

interface FlatWebsite {
	pid: string
	category: string
	id: string
	title: string
	index: number
}

const repoStore = useRepoStore()
const isLoading = ref(false)
const flatWebsiteData = computed<FlatWebsite[]>(() => {
	return repoStore.websiteData.reduce((res, cur) => {
		const { id: pid, category, list } = cur
		list.forEach(({ id, title }: any, index: number) => {
			res.push({ pid, category, id, title, index })
		})
		return res
	}, [])
})

const isStar = computed(
	() =>
		(id: string): boolean =>
			flatWebsiteData.value.findIndex(website => website.id === id) > -1
)

initData()
function initData() {
	repoStore.apiGetWebsiteData()
}

const handleClick = async (website: any) => {
	try {
		isLoading.value = true
		let msg: string
		const { id } = website
		const { websiteData } = repoStore
		const cloneData: any = websiteData.map((item: any) => ({ ...item, list: [...item.list] }))
		if (isEmpty(cloneData)) {
			cloneData.push({
				sort: 0,
				id: getId(),
				category: '默认分类',
				list: [website]
			})
			msg = '收藏'
		} else {
			const isFind = flatWebsiteData.value.find((item: FlatWebsite) => item.id === id)
			if (isFind) {
				const { pid, index } = isFind
				const curCategory = cloneData.find((item: any) => item.id === pid)
				curCategory.list.splice(index, 1)
				msg = '取消收藏'
			} else {
				const defaultCategory = cloneData.find((item: any) => item.category === '默认分类')
				defaultCategory.list.push(website)
				msg = '收藏'
			}
		}
		await repoStore
			.apiUpdateWebsiteData(cloneData)
			.then(async () => {
				ElMessage.success(`${msg}成功`)
			})
			.catch(() => {
				ElMessage.error(`${msg}失败，请重试`)
			})
	} catch (error: any) {
		console.error(error.message ?? error)
	} finally {
		isLoading.value = false
	}
}
</script>

<style scoped lang="less">
.bm-divider {
	@apply mx-auto my-5 w-1/4 border-t-4 border-double border-gray-500/50;
}
</style>
