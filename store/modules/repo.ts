/*
 * @Author: iuukai
 * @Date: 2023-09-01 23:33:27
 * @LastEditors: iuukai
 * @LastEditTime: 2023-09-26 12:59:52
 * @FilePath: \iki-bookmark-nuxt3\store\modules\repo.ts
 * @Description:
 * @QQ/微信: 790331286
 */
import { defineStore } from 'pinia'
import { useUserStore } from './user'
import { useCommentStore } from './comment'
import { dayjs } from 'element-plus'

interface RepoState {
	repoInfo: any
	repoShas: any
	initRepoFile: string[]
	notFoundPath: string[]
	dataJSON: any
	flatDataJSON: any
}

interface RepoFileData {
	path: string
	data?: any
}

const initRepoFile = (): string[] => [
	'README.md',
	'config.ibookmark.json',
	'website/data.json',
	'image/data.json',
	'note/data.json',
	'plan/data.json'
]

export const useRepoStore = defineStore({
	id: 'repo',
	state: (): RepoState => ({
		// 初始文件
		initRepoFile: initRepoFile(),
		repoInfo: {},
		repoShas: {},
		notFoundPath: [],
		dataJSON: {},
		flatDataJSON: {}
	}),
	getters: {
		isHasRepo(): boolean {
			return !isEmpty(this.repoInfo)
		},
		owner(): string {
			return useUserStore().loginName
		},
		repo(): string {
			return useAppConfig().db_repo
		},
		CONFIG(): any {
			const path = this.initRepoFile.find(p => /^config\./.test(p)) ?? ''
			return { ...this.dataJSON[path] }
		}
	},
	actions: {
		clear() {
			this.repoInfo = {}
			this.repoShas = {}
			this.notFoundPath = []
			this.dataJSON = {}
			this.flatDataJSON = {}
			useCommentStore().clear()
		},
		// 每次更新文件，sha都会更新
		setSha(_path: string, _sha?: string) {
			if (_sha) {
				this.repoShas[_path] = _sha
			} else {
				delete this.repoShas[_path]
			}
		},
		setRepoInfo(_info: any) {
			this.repoInfo = _info
		},
		setPathDataToState(_path: string, _data: any[]) {
			this.dataJSON[_path] = _data
			this.setFlatPathDataToState(_path, _data)
		},
		// 扁平化
		setFlatPathDataToState(_path: string, _data?: any[]) {
			const data = _data ?? this.dataJSON[_path]
			if (!isArray(data)) return
			this.flatDataJSON[_path] = data.reduce((res: any[], cur: any) => {
				const { id: pid, category, list } = cur
				list.forEach(({ id, title, created_at }: any, index: number) => {
					res.push({ pid, category, id, title, index, created_at })
				})
				return res
			}, [])
			return this.flatDataJSON[_path]
		},
		// 不存在，需要新建
		setNotFoundPath(_path: string, isNotFound: boolean = true) {
			const index = this.notFoundPath.indexOf(_path)
			if (index === -1 && isNotFound) {
				this.notFoundPath.push(_path)
			} else if (index > -1 && !isNotFound) {
				this.notFoundPath.splice(index, 1)
			}
		},
		apiGetConfigData(isInit: boolean = false) {
			const path = 'config.ibookmark.json'
			return this.apiGetRepoFileData({ path }, isInit)
		},
		apiGetWebsiteData(isInit: boolean = false) {
			const path = 'website/data.json'
			return this.apiGetRepoFileData({ path }, isInit)
		},
		apiUpdateConfigData(data?: any) {
			const path = 'config.ibookmark.json'
			return this.apiUpdateRepoFileData({ path, data })
		},
		apiUpdateWebsiteData(data?: any) {
			const path = 'website/data.json'
			return this.apiUpdateRepoFileData({ path, data })
		},
		// 获取仓库信息
		async apiGetRepoInfo() {
			try {
				const path = 'repo'
				const { statusCode, statusMessage, data }: any = await useApiGetBookmarkRepo({
					owner: this.owner,
					repo: this.repo
				})
				if (statusCode) {
					if (statusCode === 404) return this.setNotFoundPath(path)
					else throw new Error(statusMessage)
				}
				this.setRepoInfo(data)
				this.setNotFoundPath(path, false)
				return path
			} catch (error: any) {
				return Promise.reject(error)
			}
		},
		// 获取文件内容
		async apiGetRepoFileData({ path }: RepoFileData, isInit: boolean = false) {
			if (process.server) return
			if (isInit && (!this.isHasRepo || !this.owner || !isEmpty(this.dataJSON[path]))) return path
			try {
				const isJSON = /\.json$/i.test(path)
				const params = {
					owner: this.owner,
					repo: this.repo,
					path: path
				}
				const { statusCode, statusMessage, data }: any = await useApiGetBookmarkContents(params)
				if (statusCode) {
					if (statusCode === 404) return this.setNotFoundPath(path)
					else throw new Error(statusMessage)
				}
				const base64Content = Base64.dec(data.content) as string
				const content = isJSON ? JSON.parse(base64Content) : base64Content
				this.setSha(data.path, data.sha)
				if (isJSON) {
					this.setPathDataToState(path, content)
					this.setNotFoundPath(path, false)
				}
				return path
			} catch (error: any) {
				console.log(path, error)
				return Promise.reject(error)
			}
		},
		// 更新文件内容
		async apiUpdateRepoFileData({ path, data: content }: RepoFileData) {
			if (process.server) return
			try {
				const isJSON = /\.json$/i.test(path)
				const params = {
					owner: this.owner,
					repo: this.repo,
					path,
					sha: this.repoShas[path],
					content: Base64.enc(isJSON ? JSON.stringify(content) : content),
					message: `iBookmark: update ${path} - ${dayjs().format('YYYY-MM-DD HH:mm:ss')}`
				}
				const { statusCode, statusMessage, data }: any = await useApiUpdateBookmarkFile(params)
				if (statusCode) {
					if (statusCode === 404) return this.apiCreateRepoFileData({ path, data: content })
					else throw new Error(statusMessage)
				}
				this.setSha(data.content.path, data.content.sha)
				// 获取更新内容
				if (content) this.setPathDataToState(path, content)
			} catch (error) {
				return Promise.reject(error)
			}
		},
		// 新建文件内容
		async apiCreateRepoFileData({ path, data: content }: RepoFileData) {
			if (process.server) return
			try {
				const isJSON = /\.json$/i.test(path)
				const params = {
					owner: this.owner,
					repo: this.repo,
					path,
					content: Base64.enc(isJSON ? JSON.stringify(content) : content),
					message: `iBookmark: create ${path} - ${dayjs().format('YYYY-MM-DD HH:mm:ss')}`
				}
				const { statusCode, statusMessage, data }: any = await useApiCreateBookmarkFile(params)
				if (statusCode) throw new Error(statusMessage)
				this.setSha(data.content.path, data.content.sha)
			} catch (error) {
				return Promise.reject(error)
			}
		},
		// 删除文件
		async apiDeleteRepoFileData({ path }: RepoFileData) {
			if (process.server) return
			try {
				const params = {
					owner: this.owner,
					repo: this.repo,
					path,
					sha: this.repoShas[path],
					message: `iBookmark: delete ${path} - ${dayjs().format('YYYY-MM-DD HH:mm:ss')}`
				}
				const { statusCode, statusMessage }: any = await useApiDeleteBookmarkFile(params)
				if (statusCode) throw new Error(statusMessage)
				this.setSha(path)
			} catch (error) {
				return Promise.reject(error)
			}
		}
	}
})
