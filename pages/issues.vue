<!--
 * @Author: iuukai
 * @Date: 2023-08-14 06:20:12
 * @LastEditors: iuukai
 * @LastEditTime: 2023-09-26 17:11:08
 * @FilePath: \iki-bookmark-nuxt3\pages\issues.vue
 * @Description: 
 * @QQ/微信: 790331286
-->
<template>
	<div class="bm-issues">
		<el-card>
			<Skeleton type="C" :loading="loading">
				<BasicCommentCard
					ref="editorRef"
					editor
					:loading="isSubmitLoading"
					:avatar="curUserAvatar"
					:author="curUserName"
					v-model:content="content"
					@submit-comment="handleSubmit"
				/>
			</Skeleton>
		</el-card>

		<el-card class="bm-comment_list">
			<Skeleton type="C" :count="5" :loading="loading">
				<div class="relative z-10">
					<div class="bm-comment_count">
						<el-space>
							<span>{{ commentStore.ALL_COMMENTS_TOTAL }}</span>
							<span>评论</span>
						</el-space>
					</div>
					<div v-if="isEmpty(comments)" class="bg-white shadow-md">
						<el-empty :image-size="100" description="暂无评论，快来抢沙发..." />
					</div>
					<template v-else>
						<template v-for="(item, i) in comments" :key="item.id">
							<el-divider v-if="i" />
							<transition name="el-zoom-in-top" mode="out-in" appear>
								<BasicCommentCard
									:avatar="item.user.avatar_url"
									:author="item.user.login"
									:content="item.body"
									:datetime="item.created_at"
									:href="item.user.html_url"
									@quote-reply="handleReply($event, editorRef)"
								/>
							</transition>
						</template>
						<div class="bm-comment_loadmore">
							<el-button
								v-if="!isLoadedAll"
								:loading="isMoreLoading"
								class="loadmore"
								size="small"
								round
								@click="handleLoadMore"
							>
								加载更多
							</el-button>
							<el-divider v-else>我是有底线的</el-divider>
						</div>
					</template>
				</div>
				<div class="bm-paper_bg"></div>
			</Skeleton>
		</el-card>
	</div>
</template>

<script setup lang="ts">
import { useUserStore } from '@/store/modules/user'
import { useCommentStore } from '@/store/modules/comment'

definePageMeta({ middleware: ['a-need-login'] })

onBeforeMount(() => {
	// 预加载图片，避免打开表情包出现空白或者无高度
	commentStore.apiGetBilibiliEmoji()
})

const userStore = useUserStore()
const commentStore = useCommentStore()
const loading = ref(false)
const isMoreLoading = ref(false)
const isSubmitLoading = ref(false)

const content = ref('')
const editorRef = ref()
const curUserAvatar = computed(() => userStore.avatar)
const curUserName = computed(() => userStore.loginName)
const comments = computed(() => commentStore.issuesComments)
const isLoadedAll = computed(() => comments.value.length === commentStore.ALL_COMMENTS_TOTAL)

const bg = import.meta.glob('@/assets/img/background-*.svg', {
	eager: true,
	import: 'default'
})
const paperBg = computed(() => (Object.values(bg)[0] ? `url(${Object.values(bg)[0]})` : ''))

onBeforeMount(() => {
	initData()
})

async function initData() {
	try {
		loading.value = true
		await commentStore.apiGetComments(true)
		// 延迟 500ms 避免直接跳过 loading（因为有做缓存，会跳过请求）
		await new Promise(resolve => setTimeout(resolve, 500))
	} finally {
		loading.value = false
	}
}

const handleSubmit = async () => {
	if (!content.value) return ElMessage.error('请勿提交空评论')
	try {
		isSubmitLoading.value = true
		await commentStore.apiCreateComment({ body: content.value })
		content.value = ''
		ElMessage.success('评论成功')
	} catch (error) {
		ElMessage.error('评论失败，请重试')
	} finally {
		isSubmitLoading.value = false
	}
}

const handleLoadMore = async () => {
	try {
		isMoreLoading.value = true
		await commentStore.apiGetIssueComments()
	} catch (error) {
		ElMessage.error('加载失败，请重试')
	} finally {
		isMoreLoading.value = false
	}
}

const handleReply = (text: string, editor: any) => {
	if (editor) editor.handleInsertContent(text, true)
}
</script>

<style scoped lang="less">
.bm-issues {
	@apply grid gap-y-6;

	.bm-comment_list {
		@apply relative;

		.bm-comment_count {
			@apply pl-2 mb-6 text-xl font-mono font-semibold leading-10;
			@apply border-s-4 border-indigo-500 bg-gradient-to-r from-indigo-200;
		}

		.bm-comment_loadmore {
			@apply mt-4 h-8 leading-8 text-center;

			.loadmore {
				@apply text-white bg-indigo-500 hover:bg-indigo-600 shadow-lg shadow-indigo-500/50 border-none duration-300;
			}
		}

		.bm-paper_bg {
			background-image: v-bind('paperBg');
			@apply absolute top-0 left-0 w-full h-full bg-fixed bg-repeat opacity-20 pointer-events-none z-0;
		}
	}
}
</style>
