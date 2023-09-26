import { useUserStore } from '@/store/modules/user'

export default defineNuxtRouteMiddleware((to, from) => {
	if (process.server) return
	const { isLogin } = useUserStore()
	if (!isLogin) {
		return navigateTo('/')
	}
})
