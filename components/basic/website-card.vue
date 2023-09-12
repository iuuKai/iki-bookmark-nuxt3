<!--
 * @Author: iuukai
 * @Date: 2023-08-23 04:19:30
 * @LastEditors: iuukai
 * @LastEditTime: 2023-09-13 00:11:18
 * @FilePath: \iki-bookmark-nuxt3\components\basic\website-card.vue
 * @Description: 
 * @QQ/微信: 790331286
-->
<template>
	<div class="bm-website_card">
		<a v-loading="isLoading" v-ban-click class="bm-website" :href="url" target="_blank">
			<div class="bm-website_header" :title="title">
				<BasicImage class="w-10 h-10" :src="icon" fit="contain" lazy />
				<el-text class="bm-website_title" truncated tag="div">{{ title }}</el-text>
				<el-text
					:class="['bm-website_bar', { 'is-star': isStar }]"
					tag="div"
					v-permissions="[LOGIN_NAME, HASREPO_NAME]"
					@click.stop.prevent="handleClickStar"
				>
					<ClientOnly>
						<template v-if="isStar">
							<Icon name="ic:round-star" size="1rem" />
							已收藏
						</template>
						<template v-else>
							<Icon name="ic:round-star-outline" size="1rem" />
							收藏
						</template>
					</ClientOnly>
				</el-text>
				<!-- <el-dropdown
					:class="['bm-website_bar', { 'is-active': dropdownVisible }]"
					trigger="click"
					@visible-change="handleVisibleChange"
				>
					<div class="p-2 pr-4" @click.stop.prevent>
						<Icon name="uiw:more" size="1rem" />
					</div>
					<template #dropdown>
						<el-dropdown-menu>
							<el-dropdown-item>Action 1</el-dropdown-item>
							<el-dropdown-item>Action 2</el-dropdown-item>
							<el-dropdown-item>Action 3</el-dropdown-item>
							<el-dropdown-item>Action 4</el-dropdown-item>
							<el-dropdown-item>Action 5</el-dropdown-item>
						</el-dropdown-menu>
					</template>
				</el-dropdown> -->
			</div>
			<div class="bm-website_content">
				<ClientOnly>
					<el-tooltip
						popper-class="max-w-[12rem]"
						effect="dark"
						:content="description"
						placement="bottom"
						:visible="tooltipVisible && !!description"
					>
						<el-text
							class="!self-start line-clamp-2"
							tag="div"
							@mouseenter="tooltipVisible = true"
							@mouseleave="tooltipVisible = false"
						>
							{{ description }}
						</el-text>
					</el-tooltip>
				</ClientOnly>
			</div>
		</a>
	</div>
</template>

<script setup lang="ts">
import { LOGIN_NAME, HASREPO_NAME } from '@/permissions'

const emits = defineEmits(['star-change'])
const props = defineProps({
	isStar: {
		type: Boolean,
		default: false
	},
	isLoading: {
		type: Boolean,
		default: false
	},
	title: {
		type: String,
		default: ''
	},
	url: {
		type: String,
		default: ''
	},
	icon: {
		type: String,
		default: ''
	},
	likes: {
		type: Number,
		default: 0
	},
	unlikes: {
		type: Number,
		default: 0
	},
	description: {
		type: String,
		default: ''
	}
})

// const dropdownVisible = ref(false)
const tooltipVisible = ref(false)
const handleClickStar = () => {
	emits('star-change')
}
// const handleVisibleChange = (isVisible: boolean) => {
// 	dropdownVisible.value = isVisible
// }

const vBanClick = {
	mounted(el: HTMLImageElement) {
		el.addEventListener('click', e => {
			if (props.isLoading) e.preventDefault()
		})
	}
}
</script>

<style scoped lang="less">
.bm-website_card {
	&:hover .bm-website {
		@apply -translate-y-1 shadow-xl;

		.bm-website_header {
			.bm-website_bar {
				@apply opacity-100;
			}
		}
	}

	.bm-website {
		@apply relative p-3 h-28 flex flex-col rounded-lg bg-white/60 select-none overflow-hidden;
		@apply shadow-md transition duration-300;

		// &.is-active {
		// 	@apply -translate-y-1 shadow-xl;
		// }

		.bm-website_header {
			@apply flex;

			.bm-website_title {
				@apply ml-2 font-bold;
			}

			.bm-website_bar {
				@apply absolute top-0 right-0 p-1 pr-3;
				@apply opacity-0 transition duration-300;

				&.is-star {
					@apply opacity-100;
				}

				// &.is-active {
				// 	@apply opacity-100;
				// }
			}
		}

		.bm-website_content {
			@apply mt-2;
		}
	}
}
// .bm-website_card {
//   &:hover .bm-website {
//     @apply -translate-y-1 shadow-xl;
//   }

//   .bm-website {
//     @apply relative p-2 flex gap-2 items-center rounded-lg bg-white/60 select-none;
//     @apply shadow-md transition duration-300;

//     .bm-website_icon {
//       @apply flex-none flex items-center;
//     }

//     .bm-website_info {
//       @apply flex-1 flex flex-col font-bold overflow-hidden;
//     }
//   }
// }
</style>
