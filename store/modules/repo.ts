/*
 * @Author: iuukai
 * @Date: 2023-09-01 23:33:27
 * @LastEditors: iuukai
 * @LastEditTime: 2023-09-07 21:37:47
 * @FilePath: \iki-bookmark-nuxt3\store\modules\repo.ts
 * @Description:
 * @QQ/微信: 790331286
 */
import { defineStore } from 'pinia'
import { useUserStore } from './user'

export const useRepoStore = defineStore({
	id: 'repo',
	state: () => ({
		isCreateRepoDialogShow: false,
		bookmarkRepo: {},
		repoName: 'my-bookmarks',
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
			return !isEmpty(this.bookmarkRepo)
		},
		owner(): string {
			return useUserStore().loginName
		},
		repo(): string {
			return this.repoName
		}
	},
	actions: {
		setCreateRepoDialogShow(_show: boolean) {
			this.isCreateRepoDialogShow = _show
		},
		setBookmarkRepo(_bookmarkRepo: any) {
			this.bookmarkRepo = _bookmarkRepo
		}
	}
})
