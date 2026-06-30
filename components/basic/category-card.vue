<template>
	<div class="bm-category_card">
		<div class="bm-category_title">{{ data.category }}</div>
		<div class="bm-category_line">
			<div class="bm-divider_vertical"></div>
			<div class="bm-category_bar">
				<div class="bm-category_icon">
					<Icon name="ic:round-plus" @click="emits('category-command', '添加网址', data)" />
				</div>
				<div class="bm-category_icon">
					<ClientOnly>
						<el-dropdown
							trigger="click"
							class="!text-inherit"
							@command="emits('category-command', $event, data)"
						>
							<span>
								<Icon name="material-symbols:more-horiz" />
							</span>
							<template #dropdown>
								<el-dropdown-menu>
									<el-dropdown-item
										v-for="item in dropdownList"
										:key="item.text"
										:class="item.class"
										:command="item.text"
										:divided="item.divided"
									>
										<el-space>
											<Icon :name="item.icon" />
											<span>{{ item.text }}</span>
										</el-space>
									</el-dropdown-item>
								</el-dropdown-menu>
							</template>
						</el-dropdown>
					</ClientOnly>
				</div>
			</div>
		</div>
		<el-empty
			v-if="isEmpty(data.list)"
			class="!p-2 w-full"
			:image-size="50"
			description="暂无数据"
		/>
		<BasicLazyBlock v-else :placeholder-height="placeholderHeight" @active-change="handleBlockActive">
			<div class="bm-category_content">
				<BasicWebsiteSimpleCard
					v-for="website in visibleWebsites"
					:key="website.id"
					:title="website.title"
					:url="website.url"
					:icon="website.icon"
					:description="website.description"
					:isMultiple="isMultiple"
					:isSelected="isSelected(website.id)"
					@select-change="handleSelectChange(website)"
					@command="emits('website-command', $event, website, data.id)"
				/>
			</div>
			<template #placeholder>
				<div class="bm-category_placeholder" :style="{ minHeight: `${placeholderHeight}px` }">
					<span>共 {{ total }} 个书签，滚动到此区域后再渲染</span>
				</div>
			</template>
		</BasicLazyBlock>
	</div>
</template>

<script setup lang="ts">
const emits = defineEmits(['update:selectList', 'website-command', 'category-command'])
const props = defineProps({
	data: {
		type: Object,
		default: () => ({})
	},
	isMultiple: {
		type: Boolean,
		default: false
	},
	selectList: {
		type: Array,
		default: () => []
	}
})

const dropdownList = [
	{ icon: 'ph:note-pencil', text: '编辑分类', class: '', divided: false },
	{ icon: 'material-symbols:delete-outline', text: '删除分类', class: 'danger', divided: true }
]

const total = computed(() => props.data?.list?.length ?? 0)
const placeholderHeight = computed(() => {
	const count = Math.min(total.value, 10)
	const rows = Math.max(Math.ceil(count / 3), 1)
	return rows * 52 + 32
})
const renderCount = ref(24)
const hasActivated = ref(false)
const visibleWebsites = computed(() => {
	const list = props.data?.list ?? []
	return list.slice(0, renderCount.value)
})

const selected = computed({
	get: () => props.selectList,
	set: (v: string[]) => emits('update:selectList', v)
})
const isSelected = computed(() => (id: string) => selected.value.includes(id))

let renderTimer: ReturnType<typeof setTimeout> | undefined

watch(
	() => props.data?.list,
	() => {
		renderCount.value = 24
		if (hasActivated.value) scheduleRender()
	},
	{ immediate: true }
)

const scheduleRender = () => {
	clearTimeout(renderTimer)
	if (renderCount.value >= total.value) return
	renderTimer = setTimeout(() => {
		renderCount.value += 24
		scheduleRender()
	}, 16)
}

const handleBlockActive = () => {
	if (hasActivated.value) return
	hasActivated.value = true
	scheduleRender()
}

const handleSelectChange = (item: any) => {
	if (!props.isMultiple) return
	const index = selected.value.indexOf(item.id)
	if (index === -1) {
		selected.value.push(item.id)
	} else {
		selected.value.splice(index, 1)
	}
}

onBeforeUnmount(() => {
	clearTimeout(renderTimer)
})
</script>

<style scoped lang="less">
.bm-category_card {
	@apply flex rounded-lg bg-white shadow-md overflow-hidden;

	.bm-category_title {
		max-width: 120px;

		@apply p-3 flex-none w-full text-center font-bold;
	}

	.bm-category_content {
		@apply flex-1 px-4 py-3 grid gap-y-4 gap-x-6 2xl:grid-cols-5 xl:grid-cols-4 lg:grid-cols-3 md:grid-cols-3 sm:grid-cols-2;
	}

	.bm-category_placeholder {
		@apply flex-1 px-4 py-3 flex items-center text-sm text-gray-400;
	}

	.bm-divider_vertical {
		@apply h-full border border-gray-200;
	}

	.bm-category_line {
		@apply relative;

		.bm-category_bar {
			@apply absolute top-2 left-1/2 -translate-x-1/2;

			.bm-category_icon {
				@apply w-5 h-5 flex justify-center items-center rounded-full cursor-pointer;
				@apply invisible duration-300;

				&:nth-child(2) {
					@apply mt-1;
				}

				&:first-child,
				&:last-child:hover {
					@apply text-white bg-blue-400;
				}

				&:last-child {
					@apply bg-gray-100;
				}
			}
		}
	}

	&:hover {
		.bm-category_bar {
			.bm-category_icon {
				@apply visible;
			}
		}
	}
}
</style>
