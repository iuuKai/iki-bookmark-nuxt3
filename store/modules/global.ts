/*
 * @Author: iuukai
 * @Date: 2023-08-26 09:31:17
 * @LastEditors: iuukai
 * @LastEditTime: 2023-09-26 20:01:07
 * @FilePath: \iki-bookmark-nuxt3\store\modules\global.ts
 * @Description:
 * @QQ/微信: 790331286
 */
import { defineStore } from 'pinia'

interface GlobalState {
	screenWidth: number
	screenHeight: number
	isLoginDialogShow: boolean
	isSearchDialogShow: boolean
	isCreateRepoDialogShow: boolean
}
export const useGlobalStore = defineStore({
	id: 'global',
	state: (): GlobalState => ({
		screenWidth: 0,
		screenHeight: 0,
		isLoginDialogShow: false,
		isSearchDialogShow: false,
		isCreateRepoDialogShow: false
	}),
	getters: {
		PROXY_URL() {
			return useAppConfig().proxyURL
		}
	},
	actions: {
		setScreenSize(width: number = 0, height: number = 0) {
			this.screenWidth = width
			this.screenHeight = height
		},
		setLoginDialogShow(_show: boolean) {
			this.isLoginDialogShow = _show
		},
		setSearchDialogShow(_show: boolean) {
			this.isSearchDialogShow = _show
		},
		setCreateRepoDialogShow(_show: boolean) {
			this.isCreateRepoDialogShow = _show
		}
	}
})
