<!--
 * @Author: iuukai
 * @Date: 2023-09-01 19:52:20
 * @LastEditors: iuukai
 * @LastEditTime: 2023-09-02 00:20:09
 * @FilePath: \iki-bookmark-nuxt3\components\common\createDialog.vue
 * @Description: 
 * @QQ/微信: 790331286
-->
<template>
	<el-dialog
		v-if="name"
		v-model="dialogVisible"
		title="创建仓库"
		width="400px"
		:close-on-click-modal="false"
		append-to-body
	>
		<span>是否创建 "{{ name }}/my-bookmarks" 仓库?</span>
		<template #footer>
			<span class="dialog-footer">
				<el-button @click="handleCancel">取消</el-button>
				<el-button type="primary" @click="handleConfirm">创建</el-button>
			</span>
		</template>
	</el-dialog>
</template>

<script setup lang="ts">
import { useUserStore } from '@/store/modules/user'
import { useBookmarkStore } from '@/store/modules/bookmark'

const userStore = useUserStore()
const bookmarkStore = useBookmarkStore()

const dialogVisible = computed({
	get: () => bookmarkStore.isCreateRepoDialogShow,
	set: (val: boolean) => bookmarkStore.setCreateRepoDialogShow(val)
})
const name = computed(() => userStore.userInfo?.login ?? '')

const handleCancel = () => {
	dialogVisible.value = false
}
const handleConfirm = async () => {
	try {
		const params = {
			name: 'my-bookmarks',
			description: '我的书签'
		}
		const { code, msg, data }: any = await useApiCreateBookmarkRepo(params)
		if (code !== 200) throw new Error(msg)
		bookmarkStore.setBookmarkRepo(data)
		ElMessage.success('已创建 "my-bookmarks" 仓库')
	} catch (error) {
		console.error(error)
		ElMessage.error('"my-bookmarks" 仓库创建失败')
	}
	dialogVisible.value = false
}
</script>

<style scoped lang="less"></style>
