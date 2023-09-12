<!--
 * @Author: iuukai
 * @Date: 2023-08-14 06:20:11
 * @LastEditors: iuukai
 * @LastEditTime: 2023-09-13 00:10:35
 * @FilePath: \iki-bookmark-nuxt3\pages\bookmarks.vue
 * @Description: 
 * @QQ/微信: 790331286
-->
<template>
	<div>
		<div>
			<el-button :disabled="isMultiple" type="primary" @click="handleChangeDialog('添加网址')">
				添加
			</el-button>
			<el-button type="primary" @click="handleChangeDialog('查看分类')">查看分类</el-button>
			<el-button v-show="isMultiple" type="danger" @click="handleChangeDialog('批量删除')">
				批量删除
			</el-button>
		</div>

		<ClientOnly>
			<el-skeleton :loading="loading" animated>
				<template #template>
					<div class="mt-4 grid grid-cols-1 gap-y-4">
						<el-card v-for="cn in 5" :key="cn">
							<el-row>
								<el-col :span="3">
									<el-skeleton-item class="!h-8" variant="h1" />
								</el-col>
								<el-col :span="1">
									<div class="h-full flex justify-center items-center">
										<el-divider class="!h-full" direction="vertical" />
									</div>
								</el-col>
								<el-col :span="20">
									<div
										class="grid gap-y-4 gap-x-6 2xl:grid-cols-5 xl:grid-cols-4 lg:grid-cols-3 md:grid-cols-3 sm:grid-cols-2"
									>
										<el-skeleton-item
											v-for="sn in 10"
											:key="sn"
											class="!w-full !h-8"
											variant="button"
										/>
									</div>
								</el-col>
							</el-row>
						</el-card>
					</div>
				</template>
				<template #default>
					<div class="mt-4 grid grid-cols-1 gap-y-4">
						<template v-if="data.length">
							<el-card v-for="item in data" :key="item.category">
								<el-row>
									<el-col :span="3">
										<div class="text-center">{{ item.category }}</div>
									</el-col>
									<el-col :span="1">
										<div class="h-full flex justify-center items-center">
											<el-divider class="!h-full" direction="vertical" />
										</div>
									</el-col>
									<el-col :span="20">
										<div
											class="grid gap-y-4 gap-x-6 2xl:grid-cols-5 xl:grid-cols-4 lg:grid-cols-3 md:grid-cols-3 sm:grid-cols-2"
										>
											<BasicWebsiteSimpleCard
												v-for="website in item.list"
												:key="website.id"
												:title="website.title"
												:url="website.url"
												:icon="website.icon"
												:description="website.description"
												:isMultiple="isMultiple"
												:isSelected="isSelected(website.id)"
												@select-change="handleSelectChange(website)"
												@command="handleCommand($event, website)"
											/>
										</div>
									</el-col>
								</el-row>
							</el-card>
						</template>
						<el-card v-else>
							<el-empty :image-size="100" description="暂无数据" />
						</el-card>
					</div>
				</template>
			</el-skeleton>
			<el-dialog
				v-model="dialogVisible"
				:title="dialogTitle"
				width="500px"
				:close-on-click-modal="false"
			>
				<CommonDialogAddWebsite ref="addRef" :categoryList="categoryList" />
				<template #footer>
					<span class="dialog-footer">
						<el-button @click="dialogVisible = false">取消</el-button>
						<el-button type="primary" @click="dialogVisible = false">确认</el-button>
					</span>
				</template>
			</el-dialog>
		</ClientOnly>
	</div>
</template>

<script setup lang="ts">
import { useRepoStore } from '@/store/modules/repo'
import { copy } from '@/utils/custom-function'

definePageMeta({ middleware: ['auth'] })

const repoStore = useRepoStore()

// const data = computed(() =>
// 	repoStore.websiteData.reduce((res, cur) => {
// 		const curCategory = cur.category ?? '默认分类'
// 		const isFind = res.find((item: any) => item.category === curCategory)
// 		if (isFind) {
// 			isFind.list.push(cur)
// 		} else {
// 			res.push({
// 				category: curCategory,
// 				list: [cur]
// 			})
// 		}
// 		return res
// 	}, [])
// )
const data = computed(() => repoStore.websiteData)
const categoryList = computed(() =>
	data.value.map((item: any) => ({
		value: item.id,
		label: item.category
	}))
)
const errResponsePath = ref<string[]>([])

const addRef = ref()
const dialogTitle = ref<string>('')
const loading = ref(false)

const selecteds = ref<string[]>([])
const isMultiple = ref(false)
const isSelected = computed(() => (id: string) => selecteds.value.includes(id))
const dialogVisible = computed({
	get: () => !!dialogTitle.value,
	set: val => !val && (dialogTitle.value = '')
})

watch(dialogVisible, v => {
	if (unref(addRef)) unref(addRef).clearForm()
})

watch(isMultiple, v => {
	if (!v) {
		selecteds.value = []
		ElNotification({
			title: '已关闭批量操作',
			message: '点击元素将跳转新页签!',
			type: 'error'
		})
	} else {
		ElNotification({
			title: '已开启批量操作',
			message: '请点击元素进行选择',
			type: 'success'
		})
	}
})

const getWebsiteData = async () => {
	loading.value = true
	try {
		const params = {
			owner: repoStore.owner,
			repo: repoStore.repo,
			path: 'website/data.json'
		}
		const { code, msg, data }: any = await useApiGetBookmarkContents(params)
		if (code !== 200) throw new Error(msg)
		const content = JSON.parse(Base64.dec(data.content))
		repoStore.setWebsiteData(content)
		repoStore.setSha(data.path, data.sha)
	} catch (error: any) {
		console.log(error)
	}

	loading.value = false
}

getWebsiteData()

const handleCommand = async (command: string, item: any) => {
	switch (command) {
		case '复制链接': {
			const [err, succ]: any = await copy(item.url)
			if (err) ElMessage.error('复制失败')
			else ElMessage.success('复制成功')
			break
		}
		case '编辑':
			break
		case '批量处理':
			isMultiple.value = !isMultiple.value
			break
		case '删除':
			break
	}
}

const handleSelectChange = (item: any) => {
	if (!isMultiple.value) return
	const index = selecteds.value.indexOf(item.id)
	if (index === -1) {
		selecteds.value.push(item.id)
	} else {
		selecteds.value.splice(index, 1)
	}
}

const handleChangeDialog = (title: string) => {
	dialogTitle.value = title
}
</script>

<style scoped lang="less">
.bm-website_item {
	@apply rounded-md duration-300;

	&:hover {
		@apply bg-gray-200;

		.bm-website_bar {
			@apply opacity-100;
		}
	}

	.bm-website_bar {
		@apply self-end opacity-0 duration-300;

		&.is-active {
			@apply opacity-100;
		}
	}
}
</style>
