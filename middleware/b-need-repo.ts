import { useRepoStore } from '@/store/modules/repo'

export default defineNuxtRouteMiddleware((to, from) => {
	if (process.server) return
	const { isHasRepo } = useRepoStore()
	if (!isHasRepo) {
		return navigateTo('/')
	}
})
