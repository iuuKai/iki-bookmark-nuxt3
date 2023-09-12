<!--
 * @Author: iuukai
 * @Date: 2023-09-01 19:52:20
 * @LastEditors: iuukai
 * @LastEditTime: 2023-09-13 01:34:42
 * @FilePath: \iki-bookmark-nuxt3\components\common\createDialog.vue
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
			<el-alert title="请勿中断..." type="error" show-icon :closable="false" />
		</div>
		<el-scrollbar
			v-if="isNext && resultList.length"
			class="mt-4"
			ref="scrollbarRef"
			max-height="250px"
			native
		>
			<ul>
				<li v-for="item in resultList" :key="item.name" class="flex items-center gap-1">
					<template v-if="item.state === 0">
						<el-icon class="is-loading" size="1rem" color="#409EFF">
							<Loading />
						</el-icon>
						<el-text>正在创建 {{ item.name }}</el-text>
					</template>
					<template v-if="item.state === 1">
						<el-icon size="1rem" color="#67C23A">
							<CircleCheck />
						</el-icon>
						<el-text>已创建 {{ item.name }}</el-text>
					</template>
					<template v-if="item.state === -1">
						<el-icon size="1rem" color="#F56C6C">
							<CircleClose />
						</el-icon>
						<el-text>创建 {{ item.name }} 失败</el-text>
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

import { QuestionFilled, Loading, CircleCheck, CircleClose } from '@element-plus/icons-vue'

interface Result {
	name: string
	state: number
}

const userStore = useUserStore()
const repoStore = useRepoStore()

const isNext = ref<boolean>(false)
const isCreating = ref<boolean>(false)
const isDone = ref<boolean>(false)
const isLogin = computed<boolean>(() => userStore.isLogin)
const isHasRepo = computed<boolean>(() => repoStore.isHasRepo)
const dialogVisible = computed<boolean>({
	get: () => repoStore.isCreateRepoDialogShow,
	set: (val: boolean) => repoStore.setCreateRepoDialogShow(val)
})
const resultList = ref<Result[]>([])
const resultListCount = computed<number>(() => resultList.value.length)
const scrollbarRef = ref()

watch(isLogin, v => {
	if (!v) return
	const promiseList = [
		// 获取仓库信息
		repoStore.apiGetRepoInfo(),
		// 获取配置信息
		repoStore.apiGetConfigData()
	]
	Promise.all(promiseList)
})

watch(dialogVisible, v => {
	// !v && (isCreating.value = false)
	// isNext.value
})
watch(resultListCount, async v => {
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
		const { getResponseList, requestQueue } = await import('./createRequestList')
		const requestList = getResponseList()
		requestQueue(
			(done: boolean) => {
				if (done) {
					isDone.value = true
					ElNotification({
						title: 'Success',
						message: '仓库初始化完成!',
						type: 'success',
						duration: 5000
					})
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
