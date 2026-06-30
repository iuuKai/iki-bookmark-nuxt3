<template>
	<div class="bm-image" v-lazy="lazy">
		<div v-if="!state" :class="['bm-image_placeholder', { 'is-circle': circle }]" />
		<template v-else>
			<img
				v-if="state > 0"
				:class="['w-full', 'h-full', fit ? `object-${fit}` : '']"
				:src="url"
				:loading="lazy ? 'lazy' : 'eager'"
				decoding="async"
				referrerpolicy="no-referrer"
			/>
			<Icon v-else :name="errorIcon" :size="errorIconSize" />
		</template>
	</div>
</template>

<script setup lang="ts">
import type { DirectiveBinding } from 'vue'
import { useImageLoadQueue } from '@/composables/useImageLoadQueue'

type Fit = '' | 'fill' | 'contain' | 'cover' | 'none' | 'scale-down'

const emits = defineEmits(['image-visibility-change'])
const props = defineProps({
	lazy: {
		type: Boolean,
		default: false
	},
	src: {
		type: String,
		default: ''
	},
	fit: {
		type: String as PropType<Fit>,
		default: ''
	},
	circle: {
		type: Boolean,
		default: false
	},
	loadingIcon: {
		type: String,
		default: 'eos-icons:bubble-loading'
	},
	loadingIconSize: {
		type: String,
		default: '1.5rem'
	},
	errorIcon: {
		type: String,
		default: 'icon-park-outline:error-picture'
	},
	errorIconSize: {
		type: String,
		default: '2.5rem'
	}
})

const propsSrc = computed(() => props.src.replace(/^\/\//, 'https://'))

const url = ref('')
const state = ref(0)
const shouldLoad = ref(false)
const queue = useImageLoadQueue()

let img: HTMLImageElement | null = null
let hasTriedProxy = false
let cancelQueueTask: (() => void) | null = null
let releaseQueueTask: (() => void) | null = null

watch(
	propsSrc,
	() => {
		cleanup()
		url.value = ''
		state.value = 0
		hasTriedProxy = false
		if (shouldLoad.value) loadImage()
	},
	{ immediate: true }
)

const handleImageResult = (e: Event) => {
	const el = e.target as HTMLImageElement
	if (e.type === 'load') {
		url.value = el.src
		state.value = 1
		releaseQueueTask?.()
		releaseQueueTask = null
		return
	}

	if (hasTriedProxy) {
		state.value = -1
		releaseQueueTask?.()
		releaseQueueTask = null
		return
	}

	hasTriedProxy = true
	el.src = '/api/proxy/' + encodeURIComponent(propsSrc.value)
}

const loadImage = () => {
	if (state.value !== 0 || url.value) return
	if (!propsSrc.value) {
		state.value = -1
		return
	}

	if (cancelQueueTask || releaseQueueTask) return
	cancelQueueTask = queue.enqueue((done: () => void) => {
		cancelQueueTask = null
		releaseQueueTask = done
		img = new Image()
		img.decoding = 'async'
		img.referrerPolicy = 'no-referrer'
		img.src = propsSrc.value
		img.addEventListener('load', handleImageResult, false)
		img.addEventListener('error', handleImageResult, false)
	})
}

function cleanup() {
	cancelQueueTask?.()
	cancelQueueTask = null
	if (!img) return
	img.removeEventListener('load', handleImageResult, false)
	img.removeEventListener('error', handleImageResult, false)
	img.src = ''
	img = null
	releaseQueueTask?.()
	releaseQueueTask = null
}

const vLazy = {
	mounted(el: HTMLImageElement, binding: DirectiveBinding) {
		if (!binding.value) {
			shouldLoad.value = true
			loadImage()
		}
		useIntersectionObserver(el, ([{ isIntersecting }]: { isIntersecting: boolean }[]) => {
			if (isIntersecting && binding.value) {
				shouldLoad.value = true
				loadImage()
			}
			emits('image-visibility-change', isIntersecting)
		})
	},
	beforeUnmount() {
		cleanup()
	}
}
</script>

<style scoped lang="less">
.bm-image {
	@apply flex justify-center items-center;

	&_placeholder {
		@apply w-full h-full bg-gray-300/60 rounded;

		&.is-circle {
			@apply rounded-full;
		}
	}
}
</style>
