import { useUserStore } from '@/store/modules/user'

// 本地 storage 初始化
export default defineNuxtPlugin(nuxtApp => {
	const userStore = useUserStore()
	userStore.initStorageState()
})
