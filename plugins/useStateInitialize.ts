/*
 * @Author: iuukai
 * @Date: 2023-08-29 18:26:56
 * @LastEditors: iuukai
 * @LastEditTime: 2023-09-10 10:46:43
 * @FilePath: \iki-bookmark-nuxt3\plugins\useStateInitialize.ts
 * @Description:
 * @QQ/微信: 790331286
 */
import { useUserStore } from '@/store/modules/user'

// 本地 storage 初始化
export default defineNuxtPlugin(nuxtApp => {
	const userStore = useUserStore()
	userStore.initStorageState()

	console.log(11111)
})
