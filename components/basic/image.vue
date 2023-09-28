<!--
 * @Author: iuukai
 * @Date: 2023-08-22 23:27:28
 * @LastEditors: iuukai
 * @LastEditTime: 2023-09-28 13:27:10
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

const propsSrc = props.src.replace(/^\/\//, 'https://')
const fitClass = computed(() => (props.fit ? `object-${props.fit}` : ''))

const url = ref('')
const state = ref(0)

const loadImage = () => {
	if (!propsSrc) return (state.value = -1)

	const worker = new Worker()
	worker.postMessage({
		id: 'img',
		url: propsSrc
	})
	worker.addEventListener('message', (e: MessageEvent) => {
		const { code, msg, url: src } = e.data
		if (code === 200) {
			url.value = src
			state.value = 1
		} else {
			state.value = -1
		}
	})
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
	}
}
</script>

<style scoped lang="less">
.bm-image {
	@apply flex justify-center items-center;
}
</style>
