<!--
 * @Author: iuukai
 * @Date: 2023-09-16 20:42:09
 * @LastEditors: iuukai
 * @LastEditTime: 2023-09-26 17:38:42
 * @FilePath: \iki-bookmark-nuxt3\components\skeleton\block\category-card.vue
 * @Description: 
 * @QQ/微信: 790331286
-->
<template>
	<el-skeleton class="skeleton-category-card" :loading="loading" :count="count" animated>
		<template #template>
			<div class="mt-4 grid grid-cols-1 gap-y-4">
				<div class="bm-category_card">
					<div class="bm-category_title">
						<el-skeleton-item class="!h-8" variant="caption" />
					</div>
					<div class="bm-category_line">
						<div class="bm-divider_vertical"></div>
					</div>
					<div class="bm-category_content flex-1">
						<div class="flex space-x-2" v-for="n in subCount" :key="n">
							<el-skeleton-item class="!w-8 !h-8 flex-none" variant="circle" />
							<el-skeleton-item class="!h-full" variant="h3" />
						</div>
					</div>
				</div>
			</div>
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
	},
	subCount: {
		type: Number,
		default: 10
	}
})
</script>

<style scoped lang="less">
.skeleton-category-card {
	.bm-category_card {
		@apply flex rounded-lg bg-white shadow-md overflow-hidden;

		.bm-category_title {
			max-width: 120px;
			@apply p-3 flex-none w-full text-center font-bold;
		}

		.bm-category_content {
			@apply px-4 py-3 grid gap-y-4 gap-x-6 2xl:grid-cols-5 xl:grid-cols-4 lg:grid-cols-3 md:grid-cols-3 sm:grid-cols-2;
		}

		.bm-divider_vertical {
			@apply h-full border border-gray-200;
		}

		.bm-category_line {
			@apply relative;
		}
	}
}
</style>
