<!--
 * @Author: iuukai
 * @Date: 2023-09-26 19:40:45
 * @LastEditors: iuukai
 * @LastEditTime: 2023-09-26 21:11:43
 * @FilePath: \iki-bookmark-nuxt3\components\common\search-dialog.vue
 * @Description: 
 * @QQ/微信: 790331286
-->
<template>
	<el-dialog
		class="bm-search_dialog"
		modal-class="bm-search_modal"
		v-model="dialogVisible"
		width="560px"
		:show-close="false"
	>
		<el-empty class="!p-0" :image-size="100" description="该功能正在快马加鞭实现中..." />
		<template #header>
			<el-input v-model="search" size="large" class="w-50 m-2" placeholder="输入关键字搜索...">
				<template #prefix>
					<Icon name="ph:magnifying-glass" size="1.2rem"></Icon>
				</template>
			</el-input>
		</template>
	</el-dialog>
</template>

<script setup lang="ts">
import { useGlobalStore } from '@/store/modules/global'
const globalStore = useGlobalStore()

const search = ref('')

const dialogVisible = computed({
	get: () => globalStore.isSearchDialogShow,
	set: (val: boolean) => globalStore.setSearchDialogShow(val)
})
</script>

<style lang="less">
.bm-search_modal {
	@apply backdrop-blur-sm;

	// .bm-search_dialog {
	// }
}
</style>
