<!--
 * @Author: iuukai
 * @Date: 2023-08-22 23:27:28
 * @LastEditors: iuukai
 * @LastEditTime: 2023-08-23 04:58:35
 * @FilePath: \iki-bookmark-nuxt3\components\basic\image.vue
 * @Description: 
 * @QQ/微信: 790331286
-->
<template>
	<div class="bm-image" v-lazy="lazy">
		<Icon v-if="isPending" :name="loadingIcon" :size="loadingIconSize" />
		<template v-else>
			<Icon v-if="isFailed" :name="errorIcon" :size="errorIconSize" />
			<img v-else :class="['w-full', 'h-full', fitClass]" :src="url" />
		</template>
	</div>
</template>

<script setup lang="ts">
import type { DirectiveBinding } from 'vue'

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

const fitClass = computed(() => (props.fit ? `object-${props.fit}` : ''))
const state = reactive({
	isPending: true,
	isFailed: false,
	url: ''
})
const { isPending, isFailed, url } = toRefs(state)

let img: HTMLImageElement | null

const loadImage = () => {
	if (!state.isPending || state.url) return
	img = new Image()
	img.src = props.src
	img.addEventListener('load', handleImageResult, false)
	img.addEventListener('error', handleImageResult, false)
}

const handleImageResult = (e: Event) => {
	const el = e.target as HTMLImageElement
	if (e.type === 'load') state.url = el.src
	else if (e.type === 'error') state.isFailed = true
	state.isPending = false
}

// 指令
const vLazy = {
	mounted(el: HTMLImageElement, binding: DirectiveBinding) {
		if (!binding.value) loadImage()
		useIntersectionObserver(el, ([{ isIntersecting }]) => {
			// 懒加载
			if (isIntersecting && binding.value) loadImage()
			emits('image-visibility-change', isIntersecting)
		})
	},
	beforeUnmount() {
		if (img) {
			img.removeEventListener('load', handleImageResult, false)
			img.removeEventListener('error', handleImageResult, false)
			img = null
		}
	}
}
</script>

<style scoped lang="less">
.bm-image {
	@apply flex justify-center items-center;
}
</style>
