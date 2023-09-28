<!--
 * @Author: iuukai
 * @Date: 2023-09-10 23:20:46
 * @LastEditors: iuukai
 * @LastEditTime: 2023-09-28 11:51:11
 * @FilePath: \iki-bookmark-nuxt3\components\basic\website-simple-card.vue
 * @Description: 
 * @QQ/微信: 790331286
-->
<template>
	<ClientOnly>
		<el-tooltip
			popper-class="max-w-[12rem]"
			effect="dark"
			:content="description"
			placement="top"
			:visible="tooltipVisible && !!description"
		>
			<a
				:class="[
					'bm-website-simple',
					{ 'is-active': dropdownVisible, 'is-selected': isMultiple && isSelected }
				]"
				:href="url"
				:title="title"
				target="_blank"
				v-banlink
				@click="handleClick"
				@mouseenter="tooltipVisible = true"
				@mouseleave="tooltipVisible = false"
			>
				<div class="bm-website_content">
					<el-checkbox v-show="isMultiple" class="!mr-1 !h-full" :model-value="isSelected" />
					<BasicImage
						class="mr-2 w-6 h-6"
						loadingIconSize="0.8rem"
						:src="icon"
						fit="contain"
						lazy
					/>
					<el-text class="flex-1" truncated>{{ title }}</el-text>
					<el-dropdown
						:class="['bm-website_bar', { 'is-active': dropdownVisible }]"
						trigger="click"
						@visible-change="handleVisibleChange"
						@command="handleCommand"
					>
						<div @click.stop.prevent>
							<Icon name="ic:baseline-more-vert" size="1rem" />
						</div>
						<template #dropdown>
							<el-dropdown-menu>
								<el-dropdown-item
									v-for="item in dropdownList"
									:key="item.text"
									:class="item.class"
									:command="item.text"
									:divided="item.divided"
									:disabled="isMultiple && !/批量/.test(item.text)"
								>
									<el-space>
										<Icon :name="item.icon" />
										<span>{{ item.text }}</span>
									</el-space>
								</el-dropdown-item>
							</el-dropdown-menu>
						</template>
					</el-dropdown>
				</div>
			</a>
		</el-tooltip>
	</ClientOnly>
</template>

<script setup lang="ts">
const emits = defineEmits(['select-change', 'command'])
const props = defineProps({
	isMultiple: {
		type: Boolean,
		default: false
	},
	isSelected: {
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
	description: {
		type: String,
		default: ''
	}
})

const dropdownList = [
	{ icon: 'humbleicons:link', text: '复制链接', class: '', divided: false },
	{ icon: 'ph:note-pencil', text: '编辑', class: '', divided: true },
	{ icon: 'clarity:success-line', text: '批量处理', class: '', divided: false },
	{ icon: 'material-symbols:delete-outline', text: '删除', class: 'danger', divided: true }
]

const tooltipVisible = ref(false)
const dropdownVisible = ref(false)
const handleVisibleChange = (isVisible: boolean) => {
	dropdownVisible.value = isVisible
}
const handleCommand = (command: string) => {
	emits('command', command)
}
const handleClick = () => {
	emits('select-change')
}
const vBanlink = {
	mounted(el: HTMLImageElement) {
		el.addEventListener('click', e => {
			if (props.isMultiple) e.preventDefault()
		})
	}
}
</script>

<style scoped lang="less">
.bm-website-simple {
	@apply rounded-md duration-300;

	&.is-active {
		@apply bg-gray-500/20;
	}

	&.is-selected {
		@apply outline outline-offset-2 outline-blue-500 duration-100;
	}

	&:hover {
		@apply bg-gray-500/20;

		.bm-website_bar {
			@apply opacity-100;
		}
	}

	.bm-website_bar {
		@apply self-end opacity-0 duration-300;

		&.is-active {
			@apply opacity-100;
		}
	}

	.bm-website_content {
		@apply p-2 flex justify-between items-center leading-none;
	}
}
</style>
