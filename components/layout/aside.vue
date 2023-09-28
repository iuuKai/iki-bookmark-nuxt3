<!--
 * @Author: iuukai
 * @Date: 2023-08-19 13:47:59
 * @LastEditors: iuukai
 * @LastEditTime: 2023-09-28 08:19:27
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
				v-for="(menu, i) in menus"
				:key="menu.path"
				ref="items"
				:class="['bm-aside_item_wrap', { 'is-active': menu.path === route.path }]"
				@click="handleClick(items[i], menu.path)"
				@mouseenter="handleMouseHover($event, true)"
				@mouseleave="handleMouseHover($event, false)"
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

const items = ref()
const navItemWidth = ref('0')
const navItemHeight = ref('0')
const startClipRect = computed(() => `rect(0, 0, auto, 0)`)
const endClipRect = computed(() => `rect(0, ${navItemWidth.value}, auto, 0)`)

// 点击状态时，line 停留位置
const activeItemTop = ref(0)
// 动态 line 改变值
const hoverItemTop = ref(0)
const lineTop = computed(() => `${hoverItemTop.value}px`)

onMounted(() => {
	const curWrapper = unrefElement(useCurrentElement())
	const navItem = curWrapper.querySelector('.is-active .bm-aside_item')
	if (!navItem) return
	activeItemTop.value = navItem.parentElement.offsetTop
	hoverItemTop.value = navItem.parentElement.offsetTop
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

const handleMouseHover = (e: Event, isEnter: boolean) => {
	const $el: HTMLElement | null = e.target as HTMLElement
	if (e.target && isEnter) {
		hoverItemTop.value = $el.offsetTop
	} else {
		hoverItemTop.value = activeItemTop.value
	}
}

const handleClick = ($el: HTMLDivElement, path: string) => {
	activeItemTop.value = $el.offsetTop
	hoverItemTop.value = $el.offsetTop
	router.push(path)
}
</script>

<style scoped lang="less">
.bm-aside {
	@apply relative p-6 h-full flex flex-col;

	.logo {
		@apply px-4 pt-0 pb-6;
	}

	.bm-aside_nav {
		@apply relative flex flex-col space-y-4 select-none overflow-x-auto;
		@apply before:absolute before:left-0 before:w-1 before:content-[''] before:bg-indigo-500 before:duration-300;

		&::before {
			top: v-bind('lineTop');
			height: v-bind('navItemHeight');
		}

		.bm-aside_item_wrap {
			@apply relative border-l-4 border-transparent;

			&.is-active {
				// @apply border-indigo-500;
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
