<!--
 * @Author: iuukai
 * @Date: 2023-08-22 23:27:28
 * @LastEditors: iuukai
 * @LastEditTime: 2023-09-26 19:38:30
 * @FilePath: \iki-bookmark-nuxt3\components\basic\image.vue
 * @Description: 
 * @QQ/微信: 790331286
-->
<template>
	<div class="bm-image" v-lazy="lazy">
		<BasicLoading v-if="isPending" :size="loadingIconSize" :circle="circle" />
		<template v-else>
			<Icon v-if="isFailed" :name="errorIcon" :size="errorIconSize" />
			<img v-else :class="['w-full', 'h-full', fitClass]" :src="url" />
		</template>
	</div>
</template>

<script setup lang="ts">
import type { DirectiveBinding } from 'vue'
import { useGlobalStore } from '@/store/modules/global'

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

const globalStore = useGlobalStore()

let errCount = 0
let img: HTMLImageElement | null
let isProxy = false
const proxyURL = computed(() => globalStore.PROXY_URL ?? '')

const fitClass = computed(() => (props.fit ? `object-${props.fit}` : ''))
const state = reactive({
	isPending: true,
	isFailed: false,
	url: ''
})
const { isPending, isFailed, url } = toRefs(state)

const propsSrc = props.src.replace(/^\/\//, 'https://')

const loadImage = () => {
	if (!state.isPending || state.url || process.server) return
	img = new Image()
	if (propsSrc) img.src = `/api/proxy/${propsSrc}`
	else done(true)

	img.addEventListener('load', handleImageResult, false)
	img.addEventListener('error', handleImageResult, false)
}

const handleImageResult = (e: Event) => {
	const el = e.target as HTMLImageElement
	if (e.type === 'load') {
		state.url = el.src
		done(false)
	} else if (e.type === 'error') {
		errCount++
		if ((!isProxy && propsSrc) || (errCount <= 2 && propsSrc)) {
			if (errCount < 2) {
				el.src = proxyURL.value + propsSrc
			} else {
				el.src = propsSrc
			}
			isProxy = !isProxy
		} else {
			done(true)
		}
	}
}

const done = (isError: boolean = false) => {
	state.isPending = false
	state.isFailed = isError
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
