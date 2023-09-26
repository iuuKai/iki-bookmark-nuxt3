<!--
 * @Author: iuukai
 * @Date: 2023-09-01 19:52:20
 * @LastEditors: iuukai
 * @LastEditTime: 2023-09-26 19:54:27
 * @FilePath: \iki-bookmark-nuxt3\components\common\create-dialog.vue
 * @Description: 
 * @QQ/微信: 790331286
-->
<template>
	<el-dialog
		v-if="isLogin && !isHasRepo"
		v-model="dialogVisible"
		title="创建仓库"
		width="400px"
		append-to-body
		:close-on-click-modal="false"
		:before-close="handleClose"
	>
		<div class="flex items-center gap-1">
			<template v-if="isNext">
				<span>正在初始化 "my-bookmarks" 仓库...</span>
			</template>
			<template v-else>
				<span>当前操作需要访问 "my-bookmarks", 是否创建?</span>
				<el-tooltip class="box-item" effect="dark" content="私密仓库" placement="top">
					<el-icon size="1em"><QuestionFilled /></el-icon>
				</el-tooltip>
			</template>
		</div>
		<div v-if="isNext && isCreating">
			<el-alert title="请勿中断..." type="warning" show-icon :closable="false" />
		</div>
		<el-scrollbar
			v-if="isNext && resultList.length"
			class="mt-4"
			ref="scrollbarRef"
			max-height="250px"
			native
		>
			<ul>
				<li v-for="item in resultList" :key="item.value" class="flex items-center gap-1">
					<template v-if="item.state === 0">
						<el-icon class="is-loading" size="1rem" color="#409EFF">
							<Loading />
						</el-icon>
						<el-text>正在创建 {{ item.label }}</el-text>
					</template>
					<template v-if="item.state === 1">
						<el-icon size="1rem" color="#67C23A">
							<CircleCheck />
						</el-icon>
						<el-text>已创建 {{ item.label }}</el-text>
					</template>
					<template v-if="item.state === -1">
						<el-icon size="1rem" color="#F56C6C">
							<CircleClose />
						</el-icon>
						<el-text>创建 {{ item.label }} 失败</el-text>
					</template>
				</li>
			</ul>
		</el-scrollbar>
		<template #footer>
			<span class="dialog-footer">
				<el-button :disabled="isCreating" @click="handleCancel">取消</el-button>
				<el-button
					type="primary"
					:disabled="isCreating"
					:loading="isCreating"
					@click="handleConfirm"
				>
					{{ isCreating ? '正在创建' : isDone ? '已完成' : '创建' }}
				</el-button>
			</span>
		</template>
	</el-dialog>
</template>

<script setup lang="ts">
import { useUserStore } from '@/store/modules/user'
import { useRepoStore } from '@/store/modules/repo'
import { useGlobalStore } from '@/store/modules/global'

import { QuestionFilled, Loading, CircleCheck, CircleClose } from '@element-plus/icons-vue'

interface Result {
	value: string
	label: string
	state: number
}

const userStore = useUserStore()
const repoStore = useRepoStore()
const globalStore = useGlobalStore()

const isNext = ref<boolean>(false)
const isCreating = ref<boolean>(false)
const isDone = ref<boolean>(false)
const isLogin = computed<boolean>(() => userStore.isLogin)
const isHasRepo = computed<boolean>(() => repoStore.isHasRepo)
const dialogVisible = computed<boolean>({
	get: () => globalStore.isCreateRepoDialogShow,
	set: (val: boolean) => globalStore.setCreateRepoDialogShow(val)
})
const resultList = reactive<Result[]>([])
const scrollbarRef = ref()

watch(dialogVisible, (v: boolean) => {
	if (!v) {
		resultList.length = 0
	}
})
watch(resultList, async (v: any[]) => {
	if (!v.length) return
	await nextTick()
	scrollbarRef.value.setScrollTop(unrefElement(scrollbarRef).scrollHeight)
})

const handleCancel = () => {
	dialogVisible.value = false
}
const handleConfirm = async () => {
	isNext.value = true
	if (!isCreating.value && !isDone.value) {
		isCreating.value = true
		const { getResponseList, requestQueue } = await import('./create-request-list')
		const requestList = getResponseList()
		requestQueue(
			async (done: boolean) => {
				if (done) {
					try {
						const list = [
							{ reg: /^repo/, request: repoStore.apiGetRepoInfo },
							{ reg: /^config\./, request: repoStore.apiGetConfigData }
						]

						const promiseList = list
							.filter(({ reg }) => {
								const curResult = resultList.find((item: Result) => reg.test(item.value))
								const isCreated = curResult.state === 1
								const isNotFound = repoStore.notFoundPath.includes(curResult.value)
								return isCreated && isNotFound
							})
							.map(({ request }) => request())

						await Promise.all(promiseList)
					} finally {
						isDone.value = true
						ElNotification({
							title: 'Success',
							message: '仓库初始化完成!',
							type: 'success',
							duration: 5000
						})
					}
				}
				isCreating.value = false
			},
			requestList,
			resultList
		)
	} else {
		dialogVisible.value = false
	}
}
const handleClose = (done: () => void) => {
	if (!isCreating.value) return done()
	const message: string = isCreating.value ? '正在创建仓库，关闭后可能无法正常使用，是否继续？' : ''

	ElMessageBox.confirm(message, {
		confirmButtonText: '确定',
		confirmButtonClass: 'text-[red]',
		cancelButtonText: '取消'
	})
		.then(() => {
			done()
			ElMessage.error('已中断仓库初始化...')
		})
		.catch(() => {})
}
</script>

<style scoped lang="less"></style>
