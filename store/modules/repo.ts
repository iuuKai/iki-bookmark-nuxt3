/*
 * @Author: iuukai
 * @Date: 2023-09-01 23:33:27
 * @LastEditors: iuukai
 * @LastEditTime: 2023-09-12 19:33:49
 * @FilePath: \iki-bookmark-nuxt3\store\modules\repo.ts
 * @Description:
 * @QQ/微信: 790331286
 */
import { defineStore } from 'pinia'
import { useUserStore } from './user'

interface RepoState {
	isCreateRepoDialogShow: boolean
	repoInfo: any
	repoConfig: any
	repoShas: any
	initRepoFile: string[]
	websiteData: any[]
}

interface RepoFileData {
	path: string
	stateName: DataToStateName
	data?: any
}

type DataToStateName = 'repoConfig' | 'websiteData'

const initRepoFile = () => [
	// 'image/category.json',
	'image/data.json',
	// 'image/tag.json',
	'image/README.md',
	// 'note/category.json',
	'note/data.json',
	// 'note/tag.json',
	'note/README.md',
	// 'plan/category.json',
	'plan/data.json',
	// 'plan/tag.json',
	'plan/README.md',
	// 'website/category.json',
	'website/data.json',
	// 'website/tag.json',
	'website/README.md',
	'config.ibookmark.json',
	'README.md'
]

export const useRepoStore = defineStore({
	id: 'repo',
	state: (): RepoState => ({
		// 初始文件
		initRepoFile: initRepoFile(),
		isCreateRepoDialogShow: false,
		repoInfo: {},
		repoShas: {},
		repoConfig: {},
		websiteData: []
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
		dayjs() {
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
		setRepoConfig(_config: any) {
			this.repoConfig = _config
		},
		setWebsiteData(_data: any[]) {
			this.websiteData = _data
		},
		setDataToState(_name: DataToStateName, _value: any) {
			this[_name] = _value
		},
		async apiGetRepoInfo() {
			try {
				const { code, msg, data }: any = await useApiGetBookmarkRepo({
					owner: this.owner,
					repo: this.repo
				})
				if (code !== 200) throw new Error(msg)
				this.setRepoInfo(data)
			} catch (error: any) {
				return Promise.reject(error)
			}
		},
		apiGetConfigData() {
			return this.apiGetRepoFileData({ path: 'config.ibookmark.json', stateName: 'repoConfig' })
		},
		apiGetWebsiteData() {
			return this.apiGetRepoFileData({ path: 'website/data.json', stateName: 'websiteData' })
		},
		apiUpdateConfigData() {},
		apiUpdateWebsiteData(data?: any) {
			return this.apiUpdateRepoFileData({
				path: 'website/data.json',
				stateName: 'websiteData',
				data
			})
		},
		async apiGetRepoFileData({ path, stateName }: RepoFileData) {
			if (process.server) return
			try {
				const params = {
					owner: this.owner,
					repo: this.repo,
					path: path
				}
				const { code, msg, data }: any = await useApiGetBookmarkContents(params)
				if (code !== 200) throw new Error(msg)
				const content = JSON.parse(Base64.dec(data.content))
				this.setDataToState(stateName, content)
				this.setSha(data.path, data.sha)
			} catch (error: any) {
				return Promise.reject(error)
			}
		},
		async apiUpdateRepoFileData({ path, stateName, data }: RepoFileData) {
			if (process.server) return
			try {
				const params = {
					owner: this.owner,
					repo: this.repo,
					path,
					sha: this.repoShas[path],
					content: Base64.enc(JSON.stringify(data ?? this[stateName])),
					message: `iBookmark: update ${path} - ${this.dayjs().format('YYYY-MM-DD HH:mm:ss')}`
				}
				const {
					code,
					msg,
					data: { content }
				}: any = await useApiUpdateBookmarkFile(params)
				if (code !== 200) throw new Error(msg)
				await this.setSha(content.path, content.sha)
				// 获取更新内容
				if (data) this[stateName] = data
			} catch (error) {
				return Promise.reject(error)
			}
		}
	}
})
