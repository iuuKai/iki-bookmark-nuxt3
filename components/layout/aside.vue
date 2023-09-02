<!--
 * @Author: iuukai
 * @Date: 2023-08-19 13:47:59
 * @LastEditors: iuukai
 * @LastEditTime: 2023-09-02 11:49:38
 * @FilePath: \iki-bookmark-nuxt3\components\layout\aside.vue
 * @Description: 
 * @QQ/微信: 790331286
-->
<template>
	<div class="bm-aside">
		<div class="logo">
			<!-- <el-image src="~/assets/logo.png" /> -->
			<img src="~/assets/logo.png" alt="" />
		</div>
		<div class="grid grid-cols-1 gap-4 select-none">
			<div v-for="menu in menus" :key="menu.path" @click="handle(menu.path)">
				<div
					class="h-9 flex justify-start items-center cursor-pointer"
					v-permissions="menu.permissions"
				>
					<el-space>
						<Icon :name="menu.icon" size="20px" />
						<span>{{ menu.name }}</span>
					</el-space>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { LOGIN_NAME, HASREPO_NAME } from '@/permissions'

interface Menu {
	name: string
	path: string
	icon: string
	permissions?: string[]
}

const emits = defineEmits(['menu-click'])

const menus: Menu[] = [
	{
		name: '首页',
		path: '/',
		icon: 'charm:home'
	},
	{
		name: '书签',
		path: '/bookmarks',
		icon: 'ic:outline-bookmarks',
		permissions: [LOGIN_NAME, HASREPO_NAME]
	},
	{
		name: '统计',
		path: '/statistic',
		icon: 'solar:graph-linear',
		permissions: [LOGIN_NAME, HASREPO_NAME]
	},
	{
		name: '发现好玩',
		path: '/funny',
		icon: 'game-icons:magic-portal'
	},
	{
		name: '反馈',
		path: '/issues',
		icon: 'uil:comment-edit',
		permissions: [LOGIN_NAME]
	},
	{
		name: '计划',
		path: '/plans',
		icon: 'mdi:calendar-edit-outline'
	}
	// {
	// 	name: '随机'
	// }
]
const route = useRoute()
const router = useRouter()

const handle = (path: string) => {
	router.push(path)
}

watch(
	() => route.path,
	v => {
		const curMenu = menus.find(item => item.path === v)
		emits('menu-click', curMenu?.name ?? '')
	},
	{ immediate: true }
)
</script>

<style scoped lang="less">
.bm-aside {
	@apply pr-5;

	.logo {
		@apply w-40 m-auto p-5;
	}
}
</style>
