<!--
 * @Author: iuukai
 * @Date: 2023-08-06 12:24:38
 * @LastEditors: iuukai
 * @LastEditTime: 2023-08-28 07:10:22
 * @FilePath: \iki-bookmark-nuxt3\pages\index.vue
 * @Description: 
 * @QQ/微信: 790331286
-->
<template>
	<div>
		<template v-for="(item, i) in marks" :key="item.category">
			<div class="list">
				<div :class="['title my-4 font-bold', { 'mt-0': !i }]">{{ item.category }}</div>
				<div class="grid gap-3 2xl:grid-cols-4 xl:grid-cols-3 md:grid-cols-2 sm:grid-cols-1">
					<BasicWebsiteCard
						v-for="website in item.list"
						:key="website.id"
						:title="website.title"
						:url="website.url"
						:icon="website.icon"
						:likes="website.likes"
						:unlikes="website.unlikes"
						:description="website.description"
					/>
				</div>
			</div>
			<div class="bm-divider"></div>
		</template>
	</div>
</template>

<script setup lang="ts">
import defaultMarks from '@/db/index.json'

const marks = computed(() => defaultMarks)
</script>

<style scoped lang="less">
.bm-divider {
	@apply mx-auto my-5 w-1/4 border-t-4 border-double border-gray-500/50;
}
</style>
