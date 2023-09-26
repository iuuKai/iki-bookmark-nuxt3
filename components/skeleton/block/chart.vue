<template>
	<el-skeleton class="skeleton-chart-card" :loading="loading" :count="count" animated>
		<template #template>
			<BasicLoading absolute />
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
