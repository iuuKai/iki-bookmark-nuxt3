<!--
 * @Author: iuukai
 * @Date: 2023-08-19 13:47:59
 * @LastEditors: iuukai
 * @LastEditTime: 2023-09-10 23:47:05
 * @FilePath: \iki-bookmark-nuxt3\components\layout\aside.vue
 * @Description: 
 * @QQ/微信: 790331286
-->
<template>
	<div class="bm-aside">
		<div class="logo">
			<img src="~/assets/logo.png" alt="" />
		</div>
		<div class="bm-aside_nav">
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
import { useMenuStore } from '@/store/modules/menu'

const emits = defineEmits(['menu-click'])
const route = useRoute()
const router = useRouter()
const menuStore = useMenuStore()
const menus = menuStore.getMenus

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
	@apply p-6 h-full flex flex-col;

	.logo {
		@apply px-4 pt-0 pb-6;
	}

	.bm-aside_nav {
		@apply grid grid-cols-1 gap-4 select-none overflow-x-auto;
	}
}
</style>
