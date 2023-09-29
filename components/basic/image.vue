<!--
 * @Author: iuukai
 * @Date: 2023-08-22 23:27:28
 * @LastEditors: iuukai
 * @LastEditTime: 2023-09-29 14:09:47
 * @FilePath: \iki-bookmark-nuxt3\components\basic\image.vue
 * @Description: 
 * @QQ/微信: 790331286
-->
<template>
	<div class="bm-image" v-lazy="lazy">
		<BasicLoading v-if="!state" :size="loadingIconSize" :circle="circle" />
		<template v-else>
			<Icon v-if="state < 0" :name="errorIcon" :size="errorIconSize" />
			<img v-else :class="['w-full', 'h-full', fitClass]" :src="url" />
		</template>
	</div>
</template>

<script setup lang="ts">
import type { DirectiveBinding } from 'vue'
import Worker from '@/assets/workers/index.ts?worker'

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
const fitClass = computed(() => (props.fit ? `object-${props.fit}` : ''))

const url = ref('')
const state = ref(0)

watch(propsSrc, () => loadImage())

let img: HTMLImageElement | null

const loadImage = () => {
	if (!propsSrc.value) return (state.value = -1)

	const worker = new Worker()
	worker.postMessage({
		id: 'img',
		url: propsSrc.value
	})
	worker.addEventListener('message', (e: MessageEvent) => {
		const { code, msg, url: src } = e.data
		if (/webpack/i.test(src)) console.log(e.data)
		if (code === 200) {
			// 加载成果
			url.value = src
			state.value = 1
		} else {
			// 原地址二次加载
			img = new Image()
			img.src = propsSrc.value
			img.addEventListener('load', handleImageResult, false)
			img.addEventListener('error', handleImageResult, false)
		}
	})
}

const handleImageResult = (e: Event) => {
	const el = e.target as HTMLImageElement
	if (e.type === 'load') {
		url.value = el.src
		state.value = 1
	} else if (e.type === 'error') {
		// 加载失败
		state.value = -1
	}
}

// 指令
const vLazy = {
	mounted(el: HTMLImageElement, binding: DirectiveBinding) {
		if (!binding.value) loadImage()
		useIntersectionObserver(el, ([{ isIntersecting }]: { isIntersecting: boolean }[]) => {
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
