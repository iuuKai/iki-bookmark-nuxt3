/*
 * @Author: iuukai
 * @Date: 2023-09-21 03:31:20
 * @LastEditors: iuukai
 * @LastEditTime: 2023-09-26 22:12:06
 * @FilePath: \iki-bookmark-nuxt3\store\modules\comment.ts
 * @Description:
 * @QQ/微信: 790331286
 */
import { defineStore } from 'pinia'
import { useUserStore } from './user'

interface EmojiState {
	emoji: any[]
	markdown: string
	page: number
	curIndex: number
	issues: any[]
	issuesComments: any[]
}

interface PAGE_QUERY {
	page: number
	per_page: number
}

export const useCommentStore = defineStore({
	id: 'comment',
	state: (): EmojiState => ({
		emoji: [],
		markdown: '',
		page: 0,
		curIndex: 0,
		issues: [],
		// 当前加载评论
		issuesComments: []
	}),
	getters: {
		AUTHOR() {
			return useAppConfig().author.owner
		},
		OWNER(): string {
			return useUserStore().loginName
		},
		REPO(): string {
			// return useAppConfig().author.repo
			return 'iki-bookmark-nuxt3'
		},
		ISSUE_LABELS(): string[] {
			return useAppConfig().issue.labels
		},
		ISSUE_TITLE(): string {
			return useAppConfig().issue.title
		},
		ISSUE_BODY(): string {
			return useAppConfig().issue.body
		},
		flatEmojiMap(): any[] {
			return this.emoji.map(({ emote }) => [...emote]).flat()
		},
		// 每个 issue 的 comments 最大上限
		MAX_ISSUE_COMMENTS(): Number {
			// github 单个 issue 评论上限是 2500
			return 30
		},
		// 所有 issue 的评论总数
		ALL_COMMENTS_TOTAL(): number {
			return useSumBy(this.issues, 'comments')
		},
		// 每页加载评论数
		NORMAL_LIMIT(): number {
			return 10
		},
		// 当前 issue 评论总数
		QUERY_TOTAL(): number {
			return this.QUERY_ISSUE?.comments ?? 0
		},
		// 当前 issue 评论总页数
		QUERY_TOTAL_PAGE(): number {
			return useCeil(this.QUERY_TOTAL / this.NORMAL_LIMIT)
		},
		PAGE_QUERY(): PAGE_QUERY {
			return {
				page: this.QUERY_TOTAL_PAGE - this.page + 1,
				per_page: this.NORMAL_LIMIT
			}
		},
		// 需要加载评论的 issue
		QUERY_ISSUE(): any {
			return this.issues[this.curIndex] ?? {}
		},
		// 需要新增评论的 issue，肯定为首项
		UPDATE_ISSUE(): any {
			return useFirst(this.issues) ?? {}
		}
	},
	actions: {
		clear() {
			this.page = 0
			this.curIndex = 0
			this.issues = []
			this.issuesComments = []
		},
		setEmoji(_emoji: any[]) {
			this.emoji = _emoji
		},
		setMarkdown(_markdown: string) {
			this.markdown = _markdown
		},
		mapEmojiTextToURL(_text: string) {
			const curItem = useFind(this.flatEmojiMap, ['text', _text])
			return curItem ? { size: curItem.meta.size, url: curItem.url, text: curItem.text } : null
		},
		async apiGetBilibiliEmoji() {
			if (process.server) return
			if (!isEmpty(this.emoji)) return
			try {
				const { statusCode, statusMessage, data = [] }: any = await useApiGetBilibiliEmoji()
				if (statusCode) throw new Error(statusMessage)
				this.setEmoji(data)
			} catch (error) {
				return Promise.reject(error)
			}
		},
		async apiRenderMarkdown({ text = '' }: { text: string }) {
			if (process.server) return
			if (!text) return
			try {
				const { statusCode, statusMessage, data = '' }: any = await useApiRenderMarkdown({ text })
				if (statusCode) throw new Error(statusMessage)
				this.setMarkdown(data)
			} catch (error) {
				return Promise.reject(error)
			}
		},
		/**
		 * issue 操作
		 */
		nextPage(targetPage?: number) {
			targetPage ? (this.page = targetPage) : this.page++
		},
		nextIndex(targetIndex?: number) {
			targetIndex ? (this.curIndex = targetIndex) : this.curIndex++
		},
		setIssues(data: any | any[]) {
			const issues = useFlattenDeep([data])
			// 无论是对象还是数组，都放一个数组内，然后拍扁展开
			const ids = issues.map(({ id }: any) => id)
			const filterIds = this.issues.filter(({ id }) => ids.includes(id))
			if (isEmpty(filterIds)) {
				this.issues.unshift(...issues)
			}
		},
		setIssueComments(data: any | any[]) {
			// 数组则为初始时获取的评论列表，对象则为新增评论
			const isNewComment = !isArray(data)
			const comments = useCloneDeep(this.issuesComments)
			comments.push(...useFlattenDeep([data]))
			comments.sort((a: any, b: any) => Date.parse(b.created_at) - Date.parse(a.created_at))
			this.issuesComments = comments

			if (isNewComment) {
				// 更新当前 issue 的 comments
				this.UPDATE_ISSUE.comments++
			}
		},
		async apiGetComments(isInit: boolean = false) {
			if (process.server) return
			if (isInit && !isEmpty(this.issuesComments)) return
			try {
				await this.apiGetIssues()
				if (isEmpty(this.QUERY_ISSUE) || !this.QUERY_TOTAL) return

				// 取余
				const remainCount = this.QUERY_TOTAL % this.NORMAL_LIMIT

				// 首次加载评论数
				const first_comments: number =
					remainCount === this.QUERY_TOTAL || remainCount > 5
						? remainCount
						: this.NORMAL_LIMIT + remainCount
				// 首次加载页数
				const first_page: number = useCeil(first_comments / this.NORMAL_LIMIT)

				const promiseList = []
				for (let i = 1; i <= first_page; i++) {
					promiseList.push(this.apiGetIssueComments())
				}
				await Promise.all(promiseList)
			} catch (error) {
				return Promise.reject(error)
			}
		},
		// 获取 issues，只会在初始时加载一次
		async apiGetIssues() {
			if (process.server) return
			try {
				const params = {
					owner: this.OWNER,
					repo: this.REPO,
					labels: useJoin(this.ISSUE_LABELS, ',')
				}
				const { statusCode, statusMessage, data = [] }: any = await useApiGetIssues(params)
				if (statusCode) throw new Error(statusMessage)
				// 如果没有 issue，则新增一个
				if (isEmpty(data)) await this.apiCreateIssue()
				// 默认就是创建时间倒序，不需要排序
				else await this.setIssues(data)
			} catch (error) {
				return Promise.reject(error)
			}
		},
		async apiGetIssueComments() {
			if (process.server) return
			// 因为有 loadmore 组件判断，所以全部加载完将不会再执行请求，可无需判断
			// if (this.issueComments.length === this.ALL_COMMENTS_TOTAL) return
			try {
				if (this.page === this.QUERY_TOTAL_PAGE) {
					// 下一个 issue
					this.nextIndex()
					// 初始为第一页
					this.nextPage(1)
				} else {
					// 下一页
					this.nextPage()
				}
				const number = this.QUERY_ISSUE.number
				const params = {
					owner: this.OWNER,
					repo: this.REPO,
					number,
					...this.PAGE_QUERY
				}
				const { statusCode, statusMessage, data = [] }: any = await useApiGetIssueComments(params)
				if (statusCode && statusCode !== 404) throw new Error(statusMessage)
				this.setIssueComments(data)
			} catch (error) {
				return Promise.reject(error)
			}
		},
		// 新增 issue
		async apiCreateIssue() {
			try {
				const len = this.issues.length
				const params = {
					owner: this.OWNER,
					repo: this.REPO,
					title: useReplace(this.ISSUE_TITLE, '${n}', len + 1),
					// 数组
					labels: this.ISSUE_LABELS,
					body: this.ISSUE_BODY
				}
				const { statusCode, statusMessage, data }: any = await useApiCreateIssue(params)
				if (statusCode) throw new Error(statusMessage)
				await this.setIssues(data)
			} catch (error) {
				return Promise.reject(error)
			}
		},
		// 新增评论
		async apiCreateComment({ body }: { body: string }) {
			try {
				// 如果首个 issue 评论上限，则新增一个 issue 再添加评论
				if (this.UPDATE_ISSUE!.comments >= this.MAX_ISSUE_COMMENTS) {
					await this.apiCreateIssue()
				}
				// 初始为第一页
				if (!this.QUERY_TOTAL) this.nextPage(1)
				const params = {
					owner: this.OWNER,
					repo: this.REPO,
					number: this.UPDATE_ISSUE!.number,
					body
				}
				const { statusCode, statusMessage, data }: any = await useApiCreateIssueComment(params)
				if (statusCode && statusCode !== 404) throw new Error(statusMessage)
				this.setIssueComments(data)
			} catch (error) {
				return Promise.reject(error)
			}
		}
	}
})
