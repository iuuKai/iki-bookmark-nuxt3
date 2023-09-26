/*
 * @Author: iuukai
 * @Date: 2023-09-26 21:48:57
 * @LastEditors: iuukai
 * @LastEditTime: 2023-09-26 21:53:50
 * @FilePath: \iki-bookmark-nuxt3\middleware\c-access-forbidden.ts
 * @Description:
 * @QQ/微信: 790331286
 */
import { useUserStore } from '@/store/modules/user'

export default defineNuxtRouteMiddleware((to, from) => {
	if (process.server) return
	const { isLogin } = useUserStore()
	if (isLogin) {
		return navigateTo('/')
	}
})
