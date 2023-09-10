/*
 * @Author: iuukai
 * @Date: 2023-09-01 23:33:27
 * @LastEditors: iuukai
 * @LastEditTime: 2023-09-10 11:37:17
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
}

export const useRepoStore = defineStore({
	id: 'repo',
	state: (): RepoState => ({
		isCreateRepoDialogShow: false,
		repoInfo: {},
		repoConfig: [],
		repoShas: {},
		// 初始文件
		initRepoFile: [
			'image/category.json',
			'image/data.json',
			'image/tag.json',
			'image/README.md',
			'note/category.json',
			'note/data.json',
			'note/tag.json',
			'note/README.md',
			'plan/category.json',
			'plan/data.json',
			'plan/tag.json',
			'plan/README.md',
			'website/category.json',
			'website/data.json',
			'website/tag.json',
			'website/README.md',
			'config.ibookmark.json',
			'README.md'
		]
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
		}
	},
	actions: {
		setCreateRepoDialogShow(_show: boolean) {
			this.isCreateRepoDialogShow = _show
		},
		setRepoInfo(_info: any) {
			this.repoInfo = _info
		},
		setRepoConfig(_config: any) {
			this.repoConfig = _config
		},
		setSha(path: string, _sha: string) {
			this.repoShas[path] = _sha
		}
	}
})
