<!--
 * @Author: iuukai
 * @Date: 2023-08-19 13:47:59
 * @LastEditors: iuukai
 * @LastEditTime: 2023-09-27 00:14:10
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
			<div
				v-for="menu in menus"
				:key="menu.path"
				:class="['bm-aside_item_wrap', { 'is-active': menu.path === route.path }]"
				@click="handle(menu.path)"
			>
				<div class="bm-aside_item" v-permissions="menu.permissions">
					<el-space>
						<ClientOnly fallback-tag="span">
							<Icon :name="menu.icon" size="20px" />
						</ClientOnly>
						<span>{{ menu.name }}</span>
					</el-space>
				</div>
				<!-- <div class="bm-nav_propel"></div> -->
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
	(v: string) => {
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
		@apply flex flex-col space-y-4 select-none overflow-x-auto;

		.bm-aside_item_wrap {
			@apply relative border-l-4 border-transparent;

			&.is-active {
				@apply border-indigo-500;

				.bm-aside_item {
					@apply text-white from-indigo-500;
				}
			}

			.bm-nav_propel {
				// @apply absolute top-0 right-0 w-0.5 h-full bg-gray-200;
			}

			.bm-aside_item {
				@apply ml-2 pl-2 h-9 flex justify-start items-center bg-gradient-to-r cursor-pointer;
				@apply rounded-md rounded-tr-none rounded-br-none duration-300;
			}
		}
	}
}
</style>
