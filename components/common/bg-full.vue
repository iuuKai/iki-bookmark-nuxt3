<!--
 * @Author: iuukai
 * @Date: 2023-08-27 00:54:54
 * @LastEditors: iuukai
 * @LastEditTime: 2023-09-26 07:19:11
 * @FilePath: \iki-bookmark-nuxt3\components\common\bg-full.vue
 * @Description: 
 * @QQ/微信: 790331286
-->
<template>
	<div class="bm-bg__full"></div>
</template>

<script setup lang="ts">
import { useGlobalStore } from '@/store/modules/global'
import { dayjs } from 'element-plus'

const curDay = dayjs().day()
const imgModules = import.meta.glob('@/assets/img/bg_*', {
	eager: true,
	import: 'default'
})
const curImgKey = Object.keys(imgModules)[curDay]
const curBgImg = `url(${imgModules[curImgKey]})`
const globalStore = useGlobalStore()
const { width, height } = useWindowSize()
watch([width, height], ([w, h]: number[]) => globalStore.setScreenSize(w, h), { immediate: true })
</script>

<style scoped lang="less">
.bm-bg__full {
	background-image: v-bind('curBgImg');
	@apply w-screen h-screen absolute bg-center bg-no-repeat bg-cover -z-50;
}
</style>
