/*
 * @Author: iuukai
 * @Date: 2023-08-29 18:26:56
 * @LastEditors: iuukai
 * @LastEditTime: 2023-09-16 17:34:24
 * @FilePath: \iki-bookmark-nuxt3\plugins\useLaunchInit.ts
 * @Description:
 * @QQ/微信: 790331286
 */
import { useUserStore } from '@/store/modules/user'
import { useRepoStore } from '@/store/modules/repo'

// 应用加载时初始化
export default defineNuxtPlugin(async nuxtApp => {
	if (process.server) return
	try {
		const userStore = useUserStore()
		const repoStore = useRepoStore()
		// 初始state
		await userStore.initStorageState()

		const token = userStore.token
		const type = userStore.type
		const userInfo = userStore.userInfo
		if (!token) return
		if (type && isEmpty(userInfo)) {
			// 获取用户信息
			await userStore.apiGetUserInfo().catch(err => new Error(`登录失败: ${err?.message ?? err}`))
		}
		await repoStore.apiGetRepoInfo()
		if (repoStore.isHasRepo) {
			await repoStore.apiGetConfigData()
		}

		// const promiseList = [
		// 	// 获取仓库信息
		// 	repoStore.apiGetRepoInfo(),
		// 	// 获取配置信息
		// 	repoStore.apiGetConfigData()
		// ]
		// await Promise.all(promiseList).catch(() => {})
	} catch (error: any) {
		// ElMessage.error(error?.message || error)
		console.error(error?.message || error)
	}
})
