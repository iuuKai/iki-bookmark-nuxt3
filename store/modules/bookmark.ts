/*
 * @Author: iuukai
 * @Date: 2023-09-01 23:33:27
 * @LastEditors: iuukai
 * @LastEditTime: 2023-09-01 23:49:02
 * @FilePath: \iki-bookmark-nuxt3\store\modules\bookmark.ts
 * @Description:
 * @QQ/微信: 790331286
 */
import { defineStore } from 'pinia'

export const useBookmarkStore = defineStore({
	id: 'bookmark',
	state: () => ({
		isCreateRepoDialogShow: false,
		bookmarkRepo: {}
	}),
	getters: {
		isHasRepo(): boolean {
			return !isEmpty(this.bookmarkRepo)
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
