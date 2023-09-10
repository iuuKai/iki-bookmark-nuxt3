/*
 * @Author: iuukai
 * @Date: 2023-08-26 09:31:17
 * @LastEditors: iuukai
 * @LastEditTime: 2023-09-10 00:27:31
 * @FilePath: \iki-bookmark-nuxt3\store\modules\global.ts
 * @Description:
 * @QQ/微信: 790331286
 */
import { defineStore } from 'pinia'

interface GlobalState {
	screenWidth: number
	screenHeight: number
}
export const useGlobalStore = defineStore({
	id: 'global',
	state: (): GlobalState => ({
		screenWidth: 0,
		screenHeight: 0
	}),
	getters: {},
	actions: {
		setScreenSize(width: number = 0, height: number = 0) {
			this.screenWidth = width
			this.screenHeight = height
		}
	}
})
