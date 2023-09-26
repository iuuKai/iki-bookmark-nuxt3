/*
 * @Author: iuukai
 * @Date: 2023-08-30 17:20:34
 * @LastEditors: iuukai
 * @LastEditTime: 2023-09-23 23:58:57
 * @FilePath: \iki-bookmark-nuxt3\composables\useClientRequest.ts
 * @Description:
 * @QQ/微信: 790331286
 */
// import { ElMessage } from 'element-plus'
import { useUserStore } from '@/store/modules/user'

interface RequestOptions {
	url: string | Request | Ref<string | Request> | (() => string | Request)
	method?: any
	headers?: any
	params?: any
}

export const useClientRequest = (options: RequestOptions) => {
	const userStore = useUserStore()
	const { url = '', method = 'get', headers = {}, params = {} } = options
	const isGET = method.toLowerCase() === 'get'
	const token = userStore.token || params.token
	const type = userStore.oauthType || userStore.type
	if (type && !params.type) params['type'] = type

	return new Promise((resolve, reject) => {
		useFetch(url, {
			key: url + Date.now(),
			method,
			headers: { ...headers },
			timeout: 15000,
			// 失败后，不自动重复发送
			// autoRetry: false,
			onRequest({ request, options }: any) {
				if (token) options.headers['Authorization'] = `Bearer ${token}`
				options[isGET ? 'params' : 'body'] = params
			},
			onRequestError({ request, options, error }) {
				// ElMessage.closeAll()
				// error && ElMessage.error('Sorry, The Data Request Failed')
				// Handle the request errors
			},
			onResponse({ request, response, options }) {
				resolve(response._data)
				// ElMessage.error(msg ?? 'Sorry, The Data Request Failed.')
			},
			onResponseError({ request, response, options }) {
				console.log('🚀 ~ file: useClientRequest.ts:48 ~ onResponseError ~ request:', request)
			}
		})
	})
}
