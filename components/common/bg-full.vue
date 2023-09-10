<template>
	<div class="bm-bg__full"></div>
</template>

<script setup lang="ts">
import { useGlobalStore } from '@/store/modules/global'

const dayjs = useDayjs()
const curDay = dayjs().day()
const imgModules = import.meta.glob('@/assets/img/bg_*', {
	eager: true,
	import: 'default'
})
const curImgKey = Object.keys(imgModules)[curDay]
const curBgImg = `url(${imgModules[curImgKey]})`
const globalStore = useGlobalStore()
const { width, height } = useWindowSize()
watch([width, height], ([w, h]) => globalStore.setScreenSize(w, h), { immediate: true })
</script>

<style scoped lang="less">
.bm-bg__full {
	background-image: v-bind('curBgImg');
	@apply w-screen h-screen absolute bg-center bg-no-repeat bg-cover -z-50;
}
</style>
