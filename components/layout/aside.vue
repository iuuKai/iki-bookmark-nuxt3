<!--
 * @Author: iuukai
 * @Date: 2023-08-19 13:47:59
 * @LastEditors: iuukai
 * @LastEditTime: 2023-09-27 10:02:06
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
				<div v-for="n in 2" :key="n" class="bm-aside_item" v-permissions="menu.permissions">
					<el-space>
						<ClientOnly fallback-tag="span">
							<Icon :name="menu.icon" size="20px" />
						</ClientOnly>
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

const activeItem = ref()
const navItemWidth = ref('0')
const navItemHeight = ref('0')
const startClipRect = computed(() => `rect(0, 0, auto, 0)`)
const endClipRect = computed(() => `rect(0, ${navItemWidth.value}, auto, 0)`)

// const { top } = useElementBounding(activeItem)
// const lineTop = computed(() => `${top.value}px`)

onMounted(() => {
	const curWrapper = unrefElement(useCurrentElement())
	const navItem = curWrapper.querySelector('.is-active .bm-aside_item')
	activeItem.value = navItem
	navItemWidth.value = navItem.clientWidth + 'px'
	navItemHeight.value = navItem.clientHeight + 'px'
})

watch(
	() => route.path,
	(v: string) => {
		const curMenu = menus.find(item => item.path === v)
		emits('menu-click', curMenu?.name ?? '')
	},
	{ immediate: true }
)

const handle = (path: string) => {
	router.push(path)
}
</script>

<style scoped lang="less">
.bm-aside {
	@apply p-6 h-full flex flex-col;

	.logo {
		@apply px-4 pt-0 pb-6;
	}

	.bm-aside_nav {
		@apply relative flex flex-col space-y-4 select-none overflow-x-auto;

		&::before {
			// top: v-bind('lineTop');
			height: v-bind('navItemHeight');
			@apply absolute left-0 w-1 content-[''] bg-indigo-500;
		}

		.bm-aside_item_wrap {
			@apply relative border-l-4 border-transparent;

			&.is-active {
				@apply border-indigo-500;
			}

			&.is-active,
			&:hover {
				.bm-aside_item {
					&:first-child {
						clip: v-bind('endClipRect');
					}
				}
			}

			.bm-aside_item {
				@apply ml-2 pl-2 h-9 flex justify-start items-center bg-gradient-to-r cursor-pointer;
				@apply rounded-md rounded-tr-none rounded-br-none ease-out duration-1000;
				@apply first:absolute first:top-0 first:left-0 first:right-0 first:text-white first:from-indigo-500 first:z-10;

				&:first-child {
					clip: v-bind('startClipRect');
				}
			}
		}
	}
}
</style>
