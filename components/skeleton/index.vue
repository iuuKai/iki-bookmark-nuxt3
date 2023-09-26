<!--
 * @Author: iuukai
 * @Date: 2023-09-26 15:05:07
 * @LastEditors: iuukai
 * @LastEditTime: 2023-09-26 18:58:00
 * @FilePath: \iki-bookmark-nuxt3\components\skeleton\index.vue
 * @Description: 
 * @QQ/微信: 790331286
-->
<template>
	<ClientOnly>
		<component :is="mapComponent[type]" :loading="loading" :count="count" :sub-count="subCount">
			<slot />
		</component>
		<template #fallback>
			<component :is="mapComponent[type]" loading :count="count" :sub-count="subCount" />
		</template>
	</ClientOnly>
</template>

<script setup lang="ts">
const A = resolveComponent('SkeletonBlockWebsite')
const B = resolveComponent('SkeletonBlockCategory')
const C = resolveComponent('SkeletonBlockComment')
const D = resolveComponent('SkeletonBlockChart')

interface MapComponent {
	[key: string]: Component
}

type Type = 'A' | 'B' | 'C' | 'D'

defineProps({
	type: {
		type: String as PropType<Type>,
		default: 'A'
	},
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

const mapComponent: MapComponent = { A, B, C, D }
</script>

<style scoped lang="less"></style>
