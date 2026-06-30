<template>
	<div class="bm-bookmarks">
		<div>
			<el-button :disabled="isMultiple" type="primary" @click="handleChangeDialog('添加网址')">
				添加网址
			</el-button>
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

const DEFAULT_CATEGORY = '默认'

const repoStore = useRepoStore()
const updateDialogRef = ref()
const dialogTitle = ref('')
const loading = ref(true)
const isSubmitLoading = ref(false)
const path = ref('')

const data = computed(() => (path.value ? repoStore.dataJSON[path.value] ?? [] : []))
const flat = computed(() => (path.value ? repoStore.flatDataJSON[path.value] ?? [] : []))
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

watch(dialogVisible, (visible: boolean) => {
	const defaultCategoryId =
		categoryList.value.find(({ label }: { label: string }) => label === DEFAULT_CATEGORY)?.value ?? ''
	if (!visible && unref(updateDialogRef)?.clearForm) {
		unref(updateDialogRef).clearForm({ categoryId: defaultCategoryId })
	}
	if (isEmpty(curWebsiteInfo.value)) {
		curWebsiteInfo.value = { categoryId: defaultCategoryId }
	}
})

watch(isMultiple, (value: boolean) => {
	if (!value) {
		selectList.value = []
		ElNotification({
			title: '已关闭批量操作',
			message: '点击卡片会直接跳转到目标站点',
			type: 'warning'
		})
		return
	}

	ElNotification({
		title: '已开启批量操作',
		message: '点击书签即可加入或取消选择',
		type: 'success'
	})
})

onBeforeMount(() => {
	initData()
})

async function initData() {
	try {
		const res: any = await repoStore.apiGetWebsiteData(true)
		path.value = res
	} finally {
		loading.value = false
	}
}

const handleSubmit = async (type: 'website' | 'category') => {
	try {
		isSubmitLoading.value = true
		const cloneData: any = data.value.map((item: any) => ({ ...item, list: [...item.list] }))

		if (type === 'website') updateWebsite(cloneData)
		else updateCategory(cloneData)
		await repoStore.apiUpdateWebsiteData(cloneData)

		if (type === 'website') {
			const total = cloneData.reduce((res: number, cur: any) => res + cur.list.length, 0)
			const cloneConfig = configLogData({ path: path.value, total, add: 1 })
			await repoStore.apiUpdateConfigData(cloneConfig)
		}

		ElMessage.success(`${dialogTitle.value}成功`)
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
			if (item?.category === DEFAULT_CATEGORY) {
				ElMessage.error('默认分类不可删除')
			} else {
				deleteCategory(item.id, item.category)
			}
			break
		default:
			if (/编辑/.test(command)) {
				const { list, ...categoryInfo } = item
				curCategoryInfo.value = { ...categoryInfo }
			} else if (/网址/.test(command)) {
				curWebsiteInfo.value = { categoryId: item?.id ?? '' }
			}
			handleChangeDialog(command)
			break
	}
}

const handleWebsiteCommand = async (command: string, item: any, pid: string) => {
	switch (command) {
		case '复制链接': {
			const [err]: any = await useCopy(item.url)
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

const updateCategory = (cloneData: any[]) => {
	const { id, ...categoryObj } = curCategoryInfo.value
	const isNewCategory = !id

	if (isNewCategory) {
		cloneData.push({
			id: useGenerateId(),
			category: categoryObj.category,
			list: []
		})
		return
	}

	const curCategory = cloneData.find((item: any) => item.id === id)
	Object.keys(categoryObj).forEach(k => (curCategory[k] = categoryObj[k]))
}

const deleteCategory = (id: string, name: string) => {
	ElMessageBox.confirm(`是否删除分类【${name}】并清空其下所有网址？`, 'Warning', {
		type: 'warning',
		confirmButtonText: '确定',
		cancelButtonText: '取消'
	}).then(async () => {
		try {
			const cloneData: any = data.value
				.map((item: any) => ({ ...item, list: [...item.list] }))
				.filter((item: any) => item.id !== id)
			await repoStore.apiUpdateWebsiteData(cloneData)

			const total = cloneData.reduce((res: number, cur: any) => res + cur.list.length, 0)
			const del = data.value.find((item: any) => item.id === id)?.list?.length ?? 0
			const cloneConfig = configLogData({ path: path.value, total, del })
			await repoStore.apiUpdateConfigData(cloneConfig)
			ElMessage.success('删除成功')
		} catch (error: any) {
			console.log(error?.message ?? error)
			ElMessage.error('删除失败，请重试')
		}
	})
}

const updateWebsite = (cloneData: any[]) => {
	const isNewWebsite = !curWebsiteInfo.value.id
	const isNewCategory = !categoryList.value
		.map((item: any) => item.value)
		.includes(curWebsiteInfo.value.categoryId)
	const { categoryId, ...website } = curWebsiteInfo.value

	if (isNewWebsite) {
		if (isNewCategory) {
			cloneData.push({
				id: useGenerateId(),
				category: categoryId,
				list: [{ created_at: dayjs().format(), id: useGenerateId(), ...website }]
			})
		} else {
			const curCategory = cloneData.find((item: any) => item.id === categoryId)
			curCategory.list.push({ created_at: dayjs().format(), id: useGenerateId(), ...website })
		}
		return
	}

	const { pid, index } = flat.value.find((item: any) => item.id === website.id)
	const oldCategory = cloneData.find((item: any) => item.id === pid)
	oldCategory.list.splice(index, 1)

	if (isNewCategory) {
		cloneData.push({
			id: useGenerateId(),
			category: categoryId,
			list: [{ ...website }]
		})
	} else {
		const curCategory = cloneData.find((item: any) => item.id === categoryId)
		curCategory.list.push({ ...website })
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

		const total = cloneData.reduce((res: number, cur: any) => res + cur.list.length, 0)
		const del = selectList.value.length || 1
		const cloneConfig = configLogData({ path: path.value, total, del })
		await repoStore.apiUpdateConfigData(cloneConfig)

		ElMessage.success('删除成功')
		selectList.value = []
	} catch {
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
