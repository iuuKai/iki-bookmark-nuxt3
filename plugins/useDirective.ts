/*
 * @Author: iuukai
 * @Date: 2023-08-23 22:38:33
 * @LastEditors: iuukai
 * @LastEditTime: 2023-09-01 19:51:57
 * @FilePath: \iki-bookmark-nuxt3\plugins\useDirective.ts
 * @Description:
 * @QQ/微信: 790331286
 */
import { LOGIN_NAME, HASREPO_NAME, STARORGIN_NAME } from '@/permissions'
import { useUserStore } from '@/store/modules/user'
import { useBookmarkStore } from '@/store/modules/bookmark'

// 全局指令
export default defineNuxtPlugin(nuxtApp => {
	const { directive } = nuxtApp.vueApp
	const userStore = useUserStore()
	const bookmarkStore = useBookmarkStore()

	directive('permissions', {
		mounted(el, binding) {
			el.addEventListener('click', (e: Event) => {
				if (!binding.value) return
				const isLogin = userStore.isLogin
				const isHasRepo = bookmarkStore.isHasRepo
				if (
					(binding.value.includes(LOGIN_NAME) && !isLogin) ||
					(binding.value.includes(HASREPO_NAME) && !isHasRepo)
				) {
					e.stopPropagation()
					e.preventDefault()
					if (binding.value.includes(LOGIN_NAME) && !isLogin) userStore.setLoginDialogShow(true)
					if (binding.value.includes(HASREPO_NAME) && !isHasRepo)
						bookmarkStore.setCreateRepoDialogShow(true)
				}
			})
		},
		getSSRProps(binding, vnode) {
			// 你可以在这里提供SSR专用道具
			return {}
		}
	})
})
