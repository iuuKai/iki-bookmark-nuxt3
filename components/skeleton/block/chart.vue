<!--
 * @Author: iuukai
 * @Date: 2023-09-26 18:57:00
 * @LastEditors: iuukai
 * @LastEditTime: 2023-09-30 23:44:25
 * @FilePath: \iki-bookmark-nuxt3\components\skeleton\block\chart.vue
 * @Description: 
 * @QQ/微信: 790331286
-->
<template>
	<el-skeleton class="skeleton-chart-card" :loading="loading" :count="count" animated>
		<template #template>
			<BasicLoading absolute size="5rem" />
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
.skeleton-chart-card {
	@apply absolute h-full rounded-xl overflow-hidden;
}
</style>
