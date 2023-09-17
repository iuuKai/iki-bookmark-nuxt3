import { useUserStore } from '@/store/modules/user'

export default defineNuxtRouteMiddleware((to, from) => {
	if (process.server) return
	const userStore = useUserStore()
	const isLogin = userStore.isLogin
	if (!isLogin) {
		return navigateTo('/')
	}
})
