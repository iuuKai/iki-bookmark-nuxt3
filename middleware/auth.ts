/*
 * @Author: iuukai
 * @Date: 2023-09-05 03:37:35
 * @LastEditors: iuukai
 * @LastEditTime: 2023-09-12 20:44:42
 * @FilePath: \iki-bookmark-nuxt3\middleware\auth.ts
 * @Description:
 * @QQ/微信: 790331286
 */
import { useUserStore } from '@/store/modules/user'

export default defineNuxtRouteMiddleware((to, from) => {
	if (process.server) return
	const userStore = useUserStore()
	const isLogin = userStore.isLogin
	if (!isLogin && to.path !== '/') {
		return navigateTo('/')
	}
})
