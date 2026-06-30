<template>
	<div ref="rootRef" class="bm-lazy-block">
		<slot v-if="isActive" />
		<div v-else class="bm-lazy-block_placeholder" :style="placeholderStyle">
			<slot name="placeholder">
				<div class="bm-lazy-block_hint">内容将在滚动到可视区域后渲染</div>
			</slot>
		</div>
	</div>
</template>

<script setup lang="ts">
const emits = defineEmits(['active-change'])
const props = defineProps({
	once: {
		type: Boolean,
		default: true
	},
	placeholderHeight: {
		type: [Number, String],
		default: 120
	},
	rootMargin: {
		type: String,
		default: '200px 0px'
	}
})

const rootRef = ref<HTMLElement | null>(null)
const isActive = ref(false)
const placeholderStyle = computed(() => {
	const height =
		typeof props.placeholderHeight === 'number'
			? `${props.placeholderHeight}px`
			: props.placeholderHeight
	return { minHeight: height }
})

let stopObserver: (() => void) | undefined

onMounted(() => {
	if (!rootRef.value) return
	stopObserver = useIntersectionObserver(
		rootRef,
		([{ isIntersecting }]: IntersectionObserverEntry[]) => {
			if (!isIntersecting) return
			isActive.value = true
			emits('active-change', true)
			if (props.once && stopObserver) stopObserver()
		},
		{ rootMargin: props.rootMargin }
	).stop
})

onBeforeUnmount(() => {
	stopObserver?.()
})
</script>

<style scoped lang="less">
.bm-lazy-block {
	&_placeholder {
		@apply w-full rounded-md;
	}

	&_hint {
		min-height: 120px;

		@apply h-full flex items-center justify-center text-sm text-gray-400;
	}
}
</style>
