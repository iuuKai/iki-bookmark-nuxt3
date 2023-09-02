<!--
 * @Author: iuukai
 * @Date: 2023-08-14 01:45:15
 * @LastEditors: iuukai
 * @LastEditTime: 2023-09-02 02:27:31
 * @FilePath: \iki-bookmark-nuxt3\components\layout\header.vue
 * @Description: 
 * @QQ/微信: 790331286
-->
<template>
	<div>
		<div class="bm-header-wrapper" align="middle">
			<div class="flex-1 flex">
				<!-- <div class="mr-2 cursor-pointer">
				<Icon name="material-symbols:menu" size="2rem" />
			</div> -->
				<div class="max-w-xs flex-1">
					<!-- <el-input v-model="searchValue">
						<template #suffix>
							<Icon name="ph:magnifying-glass"></Icon>
						</template>
					</el-input> -->
					<div class="bm-search_button">
						<el-space>
							<Icon name="ph:magnifying-glass" size="1.2rem"></Icon>
							<span>Search</span>
						</el-space>
						<div>
							<kbd CL>CTRL</kbd>
							<span>+</span>
							<kbd>K</kbd>
						</div>
					</div>
				</div>
			</div>
			<div>
				<el-space>
					<ClientOnly>
						<el-avatar class="cursor-pointer" :src="avatar" v-permissions="[LOGIN_NAME]" />
						<template #fallback>
							<el-avatar class="cursor-pointer" :src="defaultAvatar" v-permissions="[LOGIN_NAME]" />
						</template>
					</ClientOnly>
					<ClientOnly>
						<span>{{ name }}</span>
						<template #fallback>
							<span>游客</span>
						</template>
					</ClientOnly>
					<el-switch v-model="switchValue" />
				</el-space>
			</div>
		</div>
		<ClientOnly>
			<transition name="el-zoom-in-left" mode="out-in" appear>
				<div class="mb-6 text-xl font-bold" :key="route.path">{{ menuTitle }}</div>
			</transition>
			<template #fallback>
				<div class="mb-6 text-xl font-bold">Loading Title...</div>
			</template>
		</ClientOnly>
	</div>
</template>

<script setup lang="ts">
import { LOGIN_NAME } from '@/permissions'
import { useUserStore } from '@/store/modules/user'
defineProps({
	menuTitle: {
		type: String,
		default: ''
	}
})

const defaultAvatar = (await import('@/assets/img/avatar_02.png')).default

const route = useRoute()
const userStore = useUserStore()
const state = reactive({
	searchValue: '',
	switchValue: false
})
const { searchValue, switchValue } = toRefs(state)
const avatar = computed(() => userStore.avatar || defaultAvatar)
const name = computed(() => (isEmpty(userStore.userInfo) ? '游客' : userStore.userInfo.login))
</script>

<style scoped lang="less">
.bm-header-wrapper {
	@apply mb-4 flex items-center justify-between;

	.bm-search_button {
		@apply w-full h-8 px-4 flex justify-between items-center text-gray-400 bg-white rounded-lg cursor-pointer select-none;
	}
}
</style>
