<template>
	<div class="bm-aside">
		<div class="logo">
			<img src="~/assets/logo.png" alt="" />
		</div>
		<div class="bm-aside_nav">
			<div
				:class="['bm-aside_indicator', { 'is-ready': indicatorReady }]"
				:style="{ transform: lineTransform, height: navItemHeight }"
			></div>
			<div
				v-for="menu in menus"
				:key="menu.path"
				ref="items"
				:class="['bm-aside_item_wrap', { 'is-active': menu.path === route.path }]"
				@click="handleClick($event, menu.path)"
				@mouseenter="handleMouseHover($event, true)"
				@mouseleave="handleMouseHover($event, false)"
			>
				<div class="bm-aside_item" v-permissions="menu.permissions">
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

const items = ref<HTMLElement[]>([])
const navItemHeight = ref('36px')
const indicatorReady = ref(false)

const activeItemTop = ref(0)
const hoverItemTop = ref(0)
const lineTransform = computed(() => `translate3d(0, ${hoverItemTop.value}px, 0)`)

const syncActiveLine = () => {
	const target = items.value.find((el: HTMLElement) => el?.classList.contains('is-active'))
	if (!target) return
	activeItemTop.value = target.offsetTop
	hoverItemTop.value = target.offsetTop
	const item = target.querySelector('.bm-aside_item') as HTMLElement | null
	if (item) navItemHeight.value = `${item.offsetHeight}px`
	if (!indicatorReady.value) indicatorReady.value = true
}

onMounted(() => {
	syncActiveLine()
})

watch(
	() => route.path,
	(v: string) => {
		const curMenu = menus.find(item => item.path === v)
		emits('menu-click', curMenu?.name ?? '')
		nextTick(syncActiveLine)
	},
	{ immediate: true }
)

const handleMouseHover = (e: Event, isEnter: boolean) => {
	if (!isEnter) {
		hoverItemTop.value = activeItemTop.value
		return
	}
	const el = e.currentTarget as HTMLElement | null
	if (!el) return
	hoverItemTop.value = el.offsetTop
}

const handleClick = (e: Event, path: string) => {
	const el = e.currentTarget as HTMLElement | null
	if (el) {
		activeItemTop.value = el.offsetTop
		hoverItemTop.value = el.offsetTop
	}
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
		@apply relative flex flex-col space-y-4 select-none overflow-x-hidden;

		.bm-aside_indicator {
			@apply absolute left-0 w-1 rounded bg-indigo-500;

			opacity: 0;
			transition: none;
			will-change: transform;

			&.is-ready {
				opacity: 1;
				transition: transform 200ms ease-out, opacity 120ms linear;
			}
		}

		.bm-aside_item_wrap {
			@apply relative border-l-4 border-transparent;
			@apply transition-transform duration-150 ease-out;

			&.is-active .bm-aside_item,
			&:hover .bm-aside_item {
				@apply text-white;

				&::before {
					opacity: 1;
					transform: scaleX(1);
				}
			}

			.bm-aside_item {
				@apply relative ml-2 pl-2 h-9 flex items-center rounded-md rounded-tr-none rounded-br-none cursor-pointer;
				@apply transition-colors duration-150 ease-out;

				contain: layout paint;

				&::before {
					content: '';

					@apply absolute inset-0 rounded-md rounded-tr-none rounded-br-none bg-gradient-to-r from-indigo-500;

					opacity: 0;
					transform: scaleX(0.92);
					transform-origin: left center;
					transition: transform 180ms ease-out, opacity 180ms ease-out;
					will-change: transform, opacity;
					z-index: -1;
				}
			}
		}
	}
}
</style>
