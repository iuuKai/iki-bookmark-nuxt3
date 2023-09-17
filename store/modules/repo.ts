/*
 * @Author: iuukai
 * @Date: 2023-09-01 23:33:27
 * @LastEditors: iuukai
 * @LastEditTime: 2023-09-16 19:20:53
 * @FilePath: \iki-bookmark-nuxt3\store\modules\repo.ts
 * @Description:
 * @QQ/微信: 790331286
 */
import { defineStore } from 'pinia'
import { useUserStore } from './user'

interface RepoState {
	isCreateRepoDialogShow: boolean
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

const initRepoFile = () => [
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
		isCreateRepoDialogShow: false,
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
			return 'my-bookmarks'
		},
		dayjs(): any {
			return useDayjs()
		}
	},
	actions: {
		setCreateRepoDialogShow(_show: boolean) {
			this.isCreateRepoDialogShow = _show
		},
		// 每次更新文件，sha都会更新
		setSha(path: string, _sha: string) {
			this.repoShas[path] = _sha
		},
		setRepoInfo(_info: any) {
			this.repoInfo = _info
		},
		setPathDataToState(_path: string, _data: any[]) {
			this.dataJSON[_path] = _data
			this.setFlatPathDataToState(_path, _data)
		},
		setFlatPathDataToState(_path: string, _data?: any[]) {
			const data = _data ?? this.dataJSON[_path]
			if (!isArray(data)) return
			this.flatDataJSON[_path] = data.reduce((res: any[], cur: any) => {
				const { id: pid, category, list } = cur
				list.forEach(({ id, title }: any, index: number) => {
					res.push({ pid, category, id, title, index })
				})
				return res
			}, [])
			return this.flatDataJSON[_path]
		},
		setNotFoundPath(_path: string, isNotFound: boolean = true) {
			const index = this.notFoundPath.indexOf(_path)
			if (index === -1 && isNotFound) {
				this.notFoundPath.push(_path)
			} else if (index > -1 && !isNotFound) {
				this.notFoundPath.splice(index, 1)
			}
		},
		async apiGetRepoInfo() {
			try {
				const { statusCode, code, message, data }: any = await useApiGetBookmarkRepo({
					owner: this.owner,
					repo: this.repo
				})
				if (code !== 200 && statusCode !== 404) throw new Error(message)
				if (statusCode === 404) return this.setNotFoundPath('repo')
				this.setRepoInfo(data)
				this.setNotFoundPath('repo', false)
			} catch (error: any) {
				return Promise.reject(error)
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
		apiUpdateConfigData() {},
		apiUpdateWebsiteData(data?: any) {
			return this.apiUpdateRepoFileData({
				path: 'website/data.json',
				data
			})
		},
		async apiGetRepoFileData({ path }: RepoFileData, isInit: boolean) {
			if (process.server) return
			if (isInit && (!this.isHasRepo || !this.owner || this.dataJSON[path])) return path
			try {
				const params = {
					owner: this.owner,
					repo: this.repo,
					path: path
				}
				const { statusCode, code, message, data }: any = await useApiGetBookmarkContents(params)
				if (code !== 200 && statusCode !== 404) throw new Error(message)
				if (statusCode === 404) return this.setNotFoundPath(path)
				const content = JSON.parse(Base64.dec(data.content))
				this.setSha(data.path, data.sha)
				this.setPathDataToState(path, content)
				this.setNotFoundPath(path, false)
				return path
			} catch (error: any) {
				return Promise.reject(error)
			}
		},
		async apiUpdateRepoFileData({ path, data }: RepoFileData) {
			if (process.server) return
			try {
				const params = {
					owner: this.owner,
					repo: this.repo,
					path,
					sha: this.repoShas[path],
					content: Base64.enc(JSON.stringify(data ?? this.dataJSON[path])),
					message: `iBookmark: update ${path} - ${this.dayjs().format('YYYY-MM-DD HH:mm:ss')}`
				}
				const {
					statusCode,
					code,
					message,
					data: { content }
				}: any = await useApiUpdateBookmarkFile(params)
				if (code !== 200 && statusCode !== 404) throw new Error(message)
				await this.setSha(content.path, content.sha)
				// 获取更新内容
				if (data) this.setPathDataToState(path, data)
			} catch (error) {
				return Promise.reject(error)
			}
		}
	}
})
