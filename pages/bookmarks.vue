<!--
 * @Author: iuukai
 * @Date: 2023-08-14 06:20:11
 * @LastEditors: iuukai
 * @LastEditTime: 2023-09-30 01:11:42
 * @FilePath: \iki-bookmark-nuxt3\pages\bookmarks.vue
 * @Description: 
 * @QQ/微信: 790331286
-->
<template>
	<div class="bm-bookmarks">
		<div>
			<el-button :disabled="isMultiple" type="primary" @click="handleChangeDialog('添加网址')">
				添加网址
			</el-button>
			<!-- <el-button type="primary" @click="handleChangeDialog('查看分类')">查看分类</el-button> -->
			<el-button
				v-show="isMultiple"
				:disabled="isEmpty(selectList)"
				type="danger"
				@click="deleteWebsite()"
			>
				批量删除
			</el-button>
			<el-button v-show="isMultiple" @click="isMultiple = false">取消批量</el-button>
			<el-button :disabled="isMultiple" type="primary" @click="handleCategoryCommand('添加分类')">
				添加分类
			</el-button>
		</div>

		<Skeleton type="B" :loading="loading" :count="5">
			<div class="mt-4 grid grid-cols-1 gap-y-4">
				<CommonEmpty v-if="isEmpty(data)" />
				<template v-else>
					<BasicCategoryCard
						v-for="item in data"
						:key="item.id"
						:data="item"
						:isMultiple="isMultiple"
						v-model:select-list="selectList"
						@website-command="handleWebsiteCommand"
						@category-command="handleCategoryCommand"
					/>
				</template>
			</div>
		</Skeleton>

		<ClientOnly>
			<el-dialog
				v-model="dialogVisible"
				:title="dialogTitle"
				width="500px"
				class="bm-bookmarks_dialog"
				:close-on-click-modal="false"
				append-to-body
			>
				<div>
					<CommonDialogUpdateCategory
						v-if="/分类/.test(dialogTitle)"
						ref="updateDialogRef"
						v-model:form-data="curCategoryInfo"
						:category-list="categoryList"
						:isSubmitLoading="isSubmitLoading"
						@cancel="dialogVisible = false"
						@confirm="handleSubmit('category')"
					/>
					<CommonDialogUpdateWebsite
						v-else
						ref="updateDialogRef"
						v-model:form-data="curWebsiteInfo"
						:category-list="categoryList"
						:isSubmitLoading="isSubmitLoading"
						@cancel="dialogVisible = false"
						@confirm="handleSubmit('website')"
					/>
				</div>
			</el-dialog>
		</ClientOnly>
	</div>
</template>

<script setup lang="ts">
import { useRepoStore } from '@/store/modules/repo'
import { dayjs } from 'element-plus'

definePageMeta({ middleware: ['a-need-login', 'b-need-repo'] })

const repoStore = useRepoStore()
const updateDialogRef = ref()
const dialogTitle = ref<string>('')
const loading = ref(false)
const isSubmitLoading = ref(false)

// 记录获取数据的文件 path
const path = ref<string>('')
const data = computed(() => (path.value ? repoStore.dataJSON[path.value] : []))
const flat = computed(() => (path.value ? repoStore.flatDataJSON[path.value] : []))
const categoryList = computed(() =>
	data.value.map((item: any) => ({
		value: item.id,
		label: item.category
	}))
)
const curWebsiteInfo = ref<any>({})
const curCategoryInfo = ref<any>({})

const selectList = ref<string[]>([])
const isMultiple = ref(false)
const dialogVisible = computed({
	get: () => !!dialogTitle.value,
	set: (v: boolean) => !v && handleChangeDialog('')
})

watch(dialogVisible, (v: boolean) => {
	const defaultCategoryId =
		categoryList.value.find(({ label }: { label: string }) => label === '默认')?.value ?? ''
	if (!v && unref(updateDialogRef)?.clearForm)
		unref(updateDialogRef).clearForm({ categoryId: defaultCategoryId })
	// 初始化
	if (isEmpty(curWebsiteInfo.value)) {
		curWebsiteInfo.value = {
			categoryId: defaultCategoryId
		}
	}
})

watch(isMultiple, (v: boolean) => {
	if (!v) {
		selectList.value = []
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

const handleSubmit = async (type: string) => {
	try {
		isSubmitLoading.value = true
		const cloneData: any = data.value.map((item: any) => ({ ...item, list: [...item.list] }))

		if (type === 'website') updateWebsite(cloneData)
		else updateCategory(cloneData)
		await repoStore.apiUpdateWebsiteData(cloneData)
		if (type === 'website') {
			const total = cloneData.reduce((res: any, cur: any) => {
				res += cur.list.length
				return res
			}, 0)
			const cloneConfig = configLogData({ total, add: 1 })
			await repoStore.apiUpdateConfigData(cloneConfig)
		}
		ElMessage.success(`${dialogTitle.value}成功!`)
		dialogVisible.value = false
	} catch (error: any) {
		console.error(error.message ?? error)
		ElMessage.error(`${dialogTitle.value}失败，请重试`)
	} finally {
		isSubmitLoading.value = false
	}
}

const handleCategoryCommand = async (command: string, item?: any) => {
	switch (command) {
		case '删除分类':
			if (item?.category === '默认') ElMessage.error('默认不可删除!')
			else deleteCategory(item.id, item.category)
			break
		default:
			if (/编辑/.test(command)) {
				const { list, ...catetoryInfo } = item
				curCategoryInfo.value = { ...catetoryInfo }
			} else {
				if (/分类/.test(command)) {
					// 添加分类
				} else {
					// 添加网址
					curWebsiteInfo.value = {
						categoryId: item.id
					}
				}
			}
			handleChangeDialog(command)
			break
	}
}

const handleWebsiteCommand = async (command: string, item: any, pid: string) => {
	switch (command) {
		case '复制链接': {
			const [err, succ]: any = await useCopy(item.url)
			if (err) ElMessage.error('复制失败')
			else ElMessage.success('复制成功')
			break
		}
		case '编辑':
			curWebsiteInfo.value = { ...item, categoryId: pid }
			handleChangeDialog('编辑网址')
			break
		case '批量处理':
			isMultiple.value = !isMultiple.value
			break
		case '删除':
			deleteWebsite(item.id, pid)
			break
	}
}

const updateCategory = (cloneData: any) => {
	const { id, ...categoryObj } = curCategoryInfo.value
	const isNewCategory: boolean = !id
	if (isNewCategory) {
		cloneData.push({
			id: useGenerateId(),
			category: categoryObj.category,
			list: []
		})
	} else {
		const curCategory = cloneData.find((item: any) => item.id === id)
		Object.keys(categoryObj).forEach(k => (curCategory[k] = categoryObj[k]))
	}
}
const deleteCategory = (id: string, name: string) => {
	ElMessageBox.confirm(`是否删除分类【${name}】并清除子集网址？`, 'Warning', {
		type: 'warning',
		confirmButtonText: '确定',
		cancelButtonText: '取消'
	}).then(async () => {
		try {
			const cloneData: any = data.value
				.map((item: any) => ({ ...item, list: [...item.list] }))
				.filter((item: any) => item.id !== id)
			await repoStore.apiUpdateWebsiteData(cloneData)

			const total = cloneData.reduce((res: any, cur: any) => {
				res += cur.list.length
				return res
			}, 0)
			const del = data.value.find((item: any) => item.id === id).list.length
			const cloneConfig = configLogData({ total, del })
			await repoStore.apiUpdateConfigData(cloneConfig)
			ElMessage.success('删除成功')
		} catch (error) {
			ElMessage.error('删除失败，请重试')
		}
	})
}

const updateWebsite = (cloneData: any) => {
	const isNetWebsite: boolean = !curWebsiteInfo.value.id
	const isNewCategory: boolean = !categoryList.value
		.map((item: any) => item.value)
		.includes(curWebsiteInfo.value.categoryId)
	const { categoryId, ...website } = curWebsiteInfo.value

	/**
	 * 新增 or 编辑
	 */
	if (isNetWebsite) {
		if (isNewCategory) {
			cloneData.push({
				id: useGenerateId(),
				// el-select 新建，categoryId 为 label
				category: categoryId,
				list: [{ created_at: dayjs().format(), id: useGenerateId(), ...website }]
			})
		} else {
			const curCategory = cloneData.find((item: any) => item.id === categoryId)
			curCategory.list.push({ created_at: dayjs().format(), id: useGenerateId(), ...website })
		}
	} else {
		// 更改分类，需要删除在旧分类里的数据
		const { pid, index } = flat.value.find((item: any) => item.id === website.id)
		const oldCategory = cloneData.find((item: any) => item.id === pid)
		oldCategory.list.splice(index, 1)

		if (isNewCategory) {
			cloneData.push({
				id: useGenerateId(),
				// el-select 新建，categoryId 为 label
				category: categoryId,
				list: [{ ...website }]
			})
		} else {
			const curCategory = cloneData.find((item: any) => item.id === categoryId)
			curCategory.list.push({ ...website })
		}
	}
}
const deleteWebsite = async (id?: string, pid?: string) => {
	try {
		const cloneData: any = data.value.map((item: any) => ({ ...item, list: [...item.list] }))
		if (isMultiple.value) {
			cloneData.forEach((cur: any) => {
				cur.list = cur.list.filter(({ id }: any) => !selectList.value.includes(id))
			})
		} else {
			const index = flat.value.find((item: any) => item.id === id)!.index
			const curCategory = cloneData.find((item: any) => item.id === pid)
			curCategory.list.splice(index, 1)
		}
		await repoStore.apiUpdateWebsiteData(cloneData)

		const total = cloneData.reduce((res: any, cur: any) => {
			res += cur.list.length
			return res
		}, 0)
		const del = selectList.value.length || 1
		const cloneConfig = configLogData({ total, del })
		await repoStore.apiUpdateConfigData(cloneConfig)

		ElMessage.success('删除成功!')
		selectList.value = []
	} catch (error: any) {
		console.error(error.message ?? error)
		ElMessage.error('删除失败，请重试')
	}
}

const handleChangeDialog = (title: string) => {
	dialogTitle.value = title
}
</script>

<style scoped lang="less">
:deep(.bm-bookmarks_dialog) {
	.el-dialog__body {
		@apply p-5;
	}
}
</style>
