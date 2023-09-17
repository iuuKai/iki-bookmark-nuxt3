<!--
 * @Author: iuukai
 * @Date: 2023-08-14 01:45:15
 * @LastEditors: iuukai
 * @LastEditTime: 2023-09-16 02:40:58
 * @FilePath: \iki-bookmark-nuxt3\components\layout\header.vue
 * @Description: 
 * @QQ/微信: 790331286
-->
<template>
	<div class="p-6 pl-0">
		<div class="bm-header-wrapper" align="middle">
			<div class="flex-1 flex">
				<div class="max-w-xs flex-1">
					<div class="bm-search_button" v-permissions="[LOGIN_NAME, HASREPO_NAME]">
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
						<el-dropdown trigger="click" :disabled="!isLogin" @command="handleCommand">
							<el-avatar class="cursor-pointer" :src="avatar" v-permissions="[LOGIN_NAME]" />
							<template #dropdown>
								<el-dropdown-menu>
									<el-dropdown-item command="logout">
										<el-space>
											<Icon name="octicon:sign-out-16" />
											<span>退出</span>
										</el-space>
									</el-dropdown-item>
								</el-dropdown-menu>
							</template>
						</el-dropdown>
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
		<div class="text-xl font-bold">
			<ClientOnly>
				<transition name="el-zoom-in-left" mode="out-in" appear>
					<span :key="route.path">{{ menuTitle }}</span>
				</transition>
				<template #fallback>
					<span>Loading Title...</span>
				</template>
			</ClientOnly>
		</div>
	</div>
</template>

<script setup lang="ts">
import { LOGIN_NAME, HASREPO_NAME } from '@/permissions'
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
const isLogin = computed(() => userStore.isLogin)

const handleCommand = (command: string) => {
	switch (command) {
		case 'logout':
			userStore.logout()
			navigateTo('/')
			break
	}
}
</script>

<style scoped lang="less">
.bm-header-wrapper {
	@apply mb-4 flex items-center justify-between;

	.bm-search_button {
		@apply w-full h-8 px-4 flex justify-between items-center text-gray-400 bg-white rounded-lg cursor-pointer select-none;
	}
}
</style>
