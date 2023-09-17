/*
 * @Author: iuukai
 * @Date: 2023-09-05 03:37:35
 * @LastEditors: iuukai
 * @LastEditTime: 2023-09-16 01:59:07
 * @FilePath: \iki-bookmark-nuxt3\middleware\auth.ts
 * @Description:
 * @QQ/微信: 790331286
 */
import { useRepoStore } from '@/store/modules/repo'

export default defineNuxtRouteMiddleware((to, from) => {
	if (process.server) return
	const repoStore = useRepoStore()
	const isHasRepo = repoStore.isHasRepo
	if (!isHasRepo) {
		return navigateTo('/')
	}
})
