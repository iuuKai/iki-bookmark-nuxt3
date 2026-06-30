import { useRepoStore } from '@/store/modules/repo'
import { useUserStore } from '@/store/modules/user'

export default defineNuxtRouteMiddleware(async (to, from) => {
	if (process.server) return
	const repoStore = useRepoStore()
	const userStore = useUserStore()

	if (!repoStore.isHasRepo) {
		userStore.initStorageState()
		if (userStore.token && !userStore.loginName) {
			await userStore.apiGetUserInfo({}).catch(() => undefined)
		}
		if (userStore.loginName) {
			await repoStore.apiGetRepoInfo().catch(() => undefined)
		}
	}

	if (!repoStore.isHasRepo) {
		return navigateTo('/')
	}
})
