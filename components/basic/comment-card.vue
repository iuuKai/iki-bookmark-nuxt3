<template>
	<div class="bm-comment_card">
		<div class="relative">
			<el-avatar class="bm-comment_avatar" :size="60" :src="imgProxy(avatar)" shape="square" />
			<img v-if="isAuthor" class="bm-comment_crown" :src="crown" />
		</div>

		<div class="flex-1">
			<template v-if="editor">
				<el-tabs
					class="bm-comment_tabs"
					v-loading="loading"
					v-model="curTabIndex"
					type="border-card"
				>
					<el-tab-pane ref="defaultTabRef" label="Write" :name="0">
						<el-input
							ref="commentTextareaRef"
							v-model="text"
							:rows="4"
							:autosize="{ minRows: 4, maxRows: 15 }"
							type="textarea"
							placeholder="输入评论..."
						/>
						<el-link :underline="false" href="http://www.markdown.cn/" target="_blank">
							<Icon name="fa6-brands:markdown" size="1.2rem" />
						</el-link>
					</el-tab-pane>
					<el-tab-pane
						v-loading="isPaneLoading"
						:style="{ minHeight: `${tabMinHeight}px` }"
						label="Preview"
						:name="1"
					>
						<div v-if="markdown" class="bm-comment_content" v-html="markdown"></div>
						<div v-else class="text-gray-500/50 select-none">没有内容...</div>
					</el-tab-pane>
				</el-tabs>

				<div class="bm-comment_controls">
					<BasicEmojiBox
						:show="!curTabIndex && !loading"
						@emoji-click="handleInsertContent"
						@before-emoji-box-show="handleTextareaFocus"
					/>
					<div class="blank_help flex-1"></div>
					<el-button type="primary" :loading="loading" @click="emits('submit-comment')">
						评论
					</el-button>
				</div>
			</template>
			<template v-else>
				<div
					:class="['bm-comment_container', { 'min-h-[118px]': isPaneLoading }]"
					v-loading="isPaneLoading"
				>
					<div class="bm-comment_header">
						<a :href="href" target="_blank" :title="href" class="name">{{ author }}</a>
						<time
							class="datetime"
							:datetime="datetime"
							:title="dayjs(datetime).format('YYYY-MM-DD HH:mm:ss')"
						>
							{{ fromNow }}
						</time>
						<el-tag v-if="isAuthor" color="#bae6fd" round>Author</el-tag>
						<div class="blank_help flex-1"></div>
						<span class="reply" @click="handleReply">回复</span>
					</div>
					<div class="bm-comment_content" v-html="markdown"></div>
				</div>
			</template>
		</div>
	</div>
</template>

<script setup lang="ts">
import { useCommentStore } from '@/store/modules/comment'
import { dayjs, TabPaneName } from 'element-plus'

const emits = defineEmits(['update:content', 'quote-reply', 'submit-comment'])
const props = defineProps({
	loading: {
		type: Boolean,
		default: false
	},
	editor: {
		type: Boolean,
		default: false
	},
	avatar: {
		type: String,
		default: ''
	},
	author: {
		type: String,
		default: ''
	},
	content: {
		type: String,
		default: ''
	},
	href: {
		type: String,
		default: ''
	},
	datetime: {
		type: String,
		default: ''
	}
})

let timer: number
let changeHeightCount = 0

const commentStore = useCommentStore()

const defaultTabRef = ref()
const commentTextareaRef = ref()
const textareaRef = computed(() => unref(commentTextareaRef)?.textarea)

const isChange = ref(false)
const isPaneLoading = ref(false)
const isAuthor = computed(() => useToUpper(props.author) === useToUpper(commentStore.AUTHOR))

const tabMinHeight = ref(0)
const curTabIndex = ref<TabPaneName>(0)
const markdown = ref('')
const text = computed({
	get: () => props.content,
	set: (v: string) => emits('update:content', v)
})
const { height: tabHeight } = useElementSize(defaultTabRef)

const nowTimestamp = ref(Date.now())
const fromNow = computed(() => dayjs(props.datetime).locale('zh-cn').from(nowTimestamp.value))

const modules = import.meta.glob('@/assets/img/crown.png', {
	eager: true,
	import: 'default'
})
const crown = useFirst(Object.values(modules))

onMounted(() => {
	// 初始 preview 渲染模式下的 markdown
	if (!props.editor) transformMarkdown(text.value)
	updateDateNow()
})

onUnmounted(() => {
	clearDateNow()
})

watch(text, (v: string) => {
	if (!v) curTabIndex.value = 0
	isChange.value = true
})

watch(curTabIndex, (tabIndex: TabPaneName) => {
	if (text.value && !markdown.value) isChange.value = true
	if (tabIndex && isChange.value) transformMarkdown(text.value)
})

watch(tabHeight, (v: number) => {
	if (v && changeHeightCount < 2) {
		changeHeightCount++
		tabMinHeight.value = v
	}
})
const imgProxy = (url: string) => (url ? `/api/proxy/${url}` : '')

// 转换 markdown
const transformMarkdown = async (text: string) => {
	isPaneLoading.value = true
	try {
		// 延迟 500ms 避免直接跳过 loading（因为有做缓存，会跳过请求）
		await new Promise(resolve => setTimeout(resolve, 500))
		const mdContent = useMarked(text).replace(/\[[^\s]*?\]/g, match => {
			const { size, url } = commentStore.mapEmojiTextToURL(match) ?? {}
			return url && url !== text
				? `<img class="emoji-${size === 1 ? 'small' : 'large'}" src=${imgProxy(url)} />`
				: match
		})
		markdown.value = mdContent

		isChange.value = false
	} finally {
		isPaneLoading.value = false
	}
}

const handleTextareaFocus = () => {
	const textareaEl: HTMLTextAreaElement = unref(textareaRef)
	if (textareaEl) textareaEl.focus()
	// 聚焦需要初始 tab
	curTabIndex.value = 0
}

const handleInsertContent = (str: string, isReply: boolean = false) => {
	const textareaEl: HTMLTextAreaElement = unref(textareaRef)
	if (!textareaEl) return
	handleTextareaFocus()
	let rangeIndex = 0
	if (isReply) {
		textareaEl.setSelectionRange(text.value.length, text.value.length)
		if (text.value.includes(str)) return ElMessage.error('请勿重复引用评论!')
		rangeIndex = text.value.length + str.length
	} else {
		const index = textareaEl.selectionStart
		rangeIndex = index + str.length
	}
	textareaEl.setRangeText(str)
	textareaEl.focus()
	textareaEl.setSelectionRange(rangeIndex, rangeIndex)

	text.value = textareaEl.value
	textareaEl.scrollTo(0, textareaEl.scrollHeight)
}

defineExpose({
	handleInsertContent
})

// 回复，需要抛出给 editor 用，上面均为 editor 使用，所以与当前并非属于同一个组件，只是封装一起而已
const handleReply = () => {
	const { author, content } = props
	const rows = [`@${author}:`].concat(content.split('\n'), '\n\n')
	const text = rows.map(row => `> ${row}`).join('\n')
	emits('quote-reply', text)
}

const updateDateNow = () => {
	timer = window.setInterval(() => {
		// 定时器，每分钟更新一次时间
		nowTimestamp.value = Date.now()
	}, 1000 * 60)
}
const clearDateNow = () => {
	window.clearInterval(timer)
}
</script>

<style scoped lang="less">
.bm-comment_card {
	@apply relative flex space-x-6 z-10;

	.bm-comment_avatar {
		@apply flex-none bg-origin-padding border-4 border-dashed;
	}

	.bm-comment_crown {
		@apply absolute -top-3 -right-3  w-6 h-6 rotate-45 z-10;
	}

	.bm-comment_tabs {
		:deep(.el-tabs__header) {
			@apply select-none;
		}
	}

	.bm-comment_controls {
		@apply mt-2 flex items-center;
	}

	.bm-comment_container {
		@apply p-4 pt-2 min-h-full bg-amber-100/80 rounded-md shadow-md;

		&:hover {
			.reply {
				@apply !opacity-100;
			}
		}

		.bm-comment_header {
			@apply mb-1 flex items-center space-x-4;

			.name {
				@apply text-base text-blue-500 hover:text-blue-800 font-semibold duration-300;
			}

			.datetime {
				@apply text-sm text-slate-500 font-medium;
			}

			.reply {
				@apply px-2 py-0 text-sm font-semibold rounded-full border text-blue-400  border-blue-200 opacity-0;
				@apply hover:text-white hover:bg-blue-400 hover:border-transparent select-none cursor-pointer duration-300;
			}
		}
	}

	:deep(.bm-comment_content) {
		overflow-wrap: anywhere;

		@apply relative min-w-full;
		@apply prose lg:prose-base prose-blockquote:bg-gray-100/50;
		@apply prose-hr:border-t-2 prose-hr:border-indigo-300 prose-a:underline prose-a:decoration-1 hover:prose-a:decoration-2;
		@apply prose-a:text-indigo-500 prose-a:decoration-indigo-500 hover:prose-a:text-indigo-600 hover:prose-a:decoration-indigo-600;

		& > :first-child,
		& > :first-child > :first-child {
			@apply !mt-0;
		}

		& > :last-child,
		& > :last-child > :last-child,
		p > img:last-child {
			@apply !mb-0;
		}

		img[class^='emoji-'] {
			@apply inline m-0 align-text-bottom;

			&.emoji-small {
				@apply w-5 h-5;
			}

			&.emoji-large {
				@apply w-14 h-14;
			}
		}

		ul {
			li.task-list-item {
				@apply list-none;

				.task-list-item-checkbox {
					@apply -ml-6 mb-1 align-middle;
				}
			}
		}
	}
}
</style>
