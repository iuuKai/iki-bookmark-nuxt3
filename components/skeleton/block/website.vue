<!--
 * @Author: iuukai
 * @Date: 2023-09-16 22:47:42
 * @LastEditors: iuukai
 * @LastEditTime: 2023-09-26 17:37:20
 * @FilePath: \iki-bookmark-nuxt3\components\skeleton\block\website-card.vue
 * @Description: 
 * @QQ/微信: 790331286
-->
<template>
	<el-skeleton class="skeleton-website-card" :loading="loading" :count="count" animated>
		<template #template>
			<div class="bm-home_list">
				<div class="my-4 px-2 pt-2 !w-52 bg-white !rounded-lg overflow-hidden">
					<el-skeleton-item class="!h-5" variant="h3" />
				</div>
				<div class="grid gap-3 2xl:grid-cols-4 xl:grid-cols-3 md:grid-cols-2 sm:grid-cols-1">
					<div v-for="n in subCount" :key="n" class="p-4 !rounded-lg bg-white">
						<div class="flex items-center space-x-3">
							<el-skeleton-item class="flex-none !w-10 !h-10 !rounded-full" variant="circle" />
							<el-skeleton-item class="!h-6" variant="text" />
						</div>
						<div>
							<el-skeleton-item class="!w-5/6" variant="text" />
							<el-skeleton-item class="!w-7/12" variant="text" />
							<el-skeleton-item class="!w-11/12" variant="text" />
						</div>
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
