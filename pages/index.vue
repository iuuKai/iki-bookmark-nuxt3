<!--
 * @Author: iuukai
 * @Date: 2023-08-06 12:24:38
 * @LastEditors: iuukai
 * @LastEditTime: 2023-09-26 17:37:52
 * @FilePath: \iki-bookmark-nuxt3\pages\index.vue
 * @Description: 
 * @QQ/微信: 790331286
-->
<template>
	<div class="bm-home">
		<Skeleton type="A" :loading="loading" :count="5" :sub-count="5">
			<template v-for="(item, i) in defaultMarks" :key="item.category">
				<div class="bm-home_list">
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
							:isSubmitLoading="isSubmitLoading"
							@star-change="handleClick(website)"
						/>
					</div>
					<div class="bm-divider"></div>
				</div>
			</template>
		</Skeleton>
	</div>
</template>

<script setup lang="ts">
import defaultMarks from '@/assets/db/index.json'
import { useRepoStore } from '@/store/modules/repo'
import { dayjs } from 'element-plus'

interface FlatWebsite {
	pid: string
	category: string
	id: string
	title: string
	index: number
}

const repoStore = useRepoStore()
const isSubmitLoading = ref(false)
const loading = ref(false)

// 记录获取数据的文件 path
const path = ref<string>('')
const data = computed<any[]>(() => (path.value ? repoStore.dataJSON[path.value] : []))
const flat = computed<any[]>(() => (path.value ? repoStore.flatDataJSON[path.value] : []))

const isStar = computed(
	() =>
		(id: string): boolean =>
			flat.value && flat.value.findIndex((website: any) => website.id === id) > -1
)

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

const handleClick = async (websiteInfo: any) => {
	if (!path.value) return
	try {
		isSubmitLoading.value = true
		let msg: string
		const { id, tags, ...website } = websiteInfo
		const cloneData: any = data.value.map((item: any) => ({ ...item, list: [...item.list] }))

		const defaultCategory = cloneData.find((item: any) => item.category === '默认')
		const isFind = flat.value.find((item: FlatWebsite) => item.id === id)

		if (isEmpty(cloneData) || (!isFind && !defaultCategory)) {
			cloneData.push({
				id: useGenerateId(),
				default: true,
				category: '默认',
				list: [{ created_at: dayjs().format(), id, ...website }]
			})
			msg = '收藏'
		} else {
			if (isFind) {
				const { pid, index } = isFind
				const curCategory = cloneData.find((item: any) => item.id === pid)
				curCategory.list.splice(index, 1)
				msg = '取消收藏'
			} else {
				defaultCategory.list.push({ created_at: dayjs().format(), id, ...website })
				msg = '收藏'
			}
		}

		await repoStore
			.apiUpdateWebsiteData(cloneData)
			.then(async () => {
				const total = cloneData.reduce((res: any, cur: any) => {
					res += cur.list.length
					return res
				}, 0)
				let cloneConfig: any
				if (msg === '收藏') {
					cloneConfig = configLogData({ total, add: 1 })
				} else {
					cloneConfig = configLogData({ total, del: 1 })
				}
				await repoStore.apiUpdateConfigData(cloneConfig)
				ElMessage.success(`${msg}成功`)
			})
			.catch(() => {
				ElMessage.error(`${msg}失败，请重试`)
			})
	} catch (error: any) {
		console.error(error.message ?? error)
	} finally {
		isSubmitLoading.value = false
	}
}

const configLogData = ({
	total = 0,
	add = 0,
	del = 0
}: {
	total: number
	add?: number
	del?: number
}) => {
	const cloneConfig = JSON.parse(JSON.stringify(repoStore.CONFIG))
	const log = cloneConfig.log
	const p = path.value
	const curDate = dayjs().format('YYYY-MM-DD')
	if (log && log[p]) {
		log[p][curDate] = {
			total,
			add: log[p][curDate] ? log[p][curDate].add + add : add,
			del: log[p][curDate] ? log[p][curDate].del + del : del
		}
	} else {
		;(log ?? ((cloneConfig.log = {}) && cloneConfig.log))[p] = {
			[curDate]: {
				total,
				add,
				del
			}
		}
	}

	return { ...cloneConfig }
}
</script>

<style scoped lang="less">
.bm-home_list {
	@apply flex flex-col;
}
</style>
