<!--
 * @Author: iuukai
 * @Date: 2023-09-16 22:47:42
 * @LastEditors: iuukai
 * @LastEditTime: 2023-09-16 23:17:48
 * @FilePath: \iki-bookmark-nuxt3\components\skeleton\website-card.vue
 * @Description: 
 * @QQ/微信: 790331286
-->
<template>
	<el-skeleton class="skeleton-website-card" :loading="loading" :count="count" animated>
		<template #template>
			<div class="bm-home_list">
				<el-skeleton-item class="title my-2 !w-40 !h-8 font-bold" variant="caption" />
				<div class="grid gap-3 2xl:grid-cols-4 xl:grid-cols-3 md:grid-cols-2 sm:grid-cols-1">
					<div v-for="n in subCount" :key="n">
						<el-skeleton-item variant="rect" class="!h-28 !block" />
					</div>
				</div>
				<div class="bm-divider"></div>
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
.skeleton-website-card {
	.bm-home_list {
		@apply flex flex-col;
	}

	.bm-divider {
		@apply mx-auto my-5 w-1/4 border-t-4 border-double border-gray-500/50;
	}
}
</style>
