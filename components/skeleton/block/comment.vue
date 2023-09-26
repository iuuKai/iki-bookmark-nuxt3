<!--
 * @Author: iuukai
 * @Date: 2023-09-26 14:58:33
 * @LastEditors: iuukai
 * @LastEditTime: 2023-09-26 16:57:43
 * @FilePath: \iki-bookmark-nuxt3\components\skeleton\block\comment-card.vue
 * @Description: 
 * @QQ/微信: 790331286
-->
<template>
	<el-skeleton class="skeleton-website-card" :loading="loading" :count="count" animated>
		<template #template>
			<div class="bm-paper_bg">
				<div class="bm-comment_card">
					<el-skeleton-item class="!w-[60px] !h-[60px] !rounded-md" variant="circle" />
					<div class="flex-1">
						<div class="bm-comment_container !py-0">
							<el-skeleton-item class="!w-11/12" variant="text" />
							<el-skeleton-item class="!w-3/4" variant="text" />
							<el-skeleton-item class="!w-4/6" variant="text" />
							<el-skeleton-item class="!w-2/5" variant="text" />
							<el-skeleton-item class="!w-2/6 ml-4" variant="text" />
							<el-skeleton-item class="!w-7/12" variant="text" />
						</div>
					</div>
				</div>
			</div>
			<el-divider v-if="count > 1" />
		</template>
		<template #default>
			<slot />
		</template>
	</el-skeleton>
</template>

<script setup lang="ts">
defineProps({
	loading: {
		type: Boolean,
		default: false
	},
	count: {
		type: Number,
		default: 1
	}
})
</script>

<style scoped lang="less">
.skeleton-website-card {
	.bm-comment_card {
		@apply relative flex space-x-6 z-10;

		.bm-comment_container {
			@apply p-4 pt-2 min-h-full rounded-md;

			.bm-comment_header {
				@apply mb-1 flex items-center space-x-4;
			}
		}
	}
}
</style>
