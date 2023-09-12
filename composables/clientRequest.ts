/*
 * @Author: iuukai
 * @Date: 2023-08-30 17:20:34
 * @LastEditors: iuukai
 * @LastEditTime: 2023-09-12 17:58:14
 * @FilePath: \iki-bookmark-nuxt3\composables\clientRequest.ts
 * @Description:
 * @QQ/微信: 790331286
 */
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/store/modules/user'

interface RequestOptions {
	url: string | Request | Ref<string | Request> | (() => string | Request)
	method?: any
	headers?: any
	params?: any
}

export const clientRequest = (options: RequestOptions) => {
	const userStore = useUserStore()
	const { url = '', method = 'get', headers = {}, params = {} } = options
	const token = userStore.token || params.token
	const type = userStore.oauthType || userStore.type
	if (type && !params.type) params['type'] = type

	return new Promise((resolve, reject) => {
		useFetch(url, {
			key: String(Math.random()),
			method,
			headers: { ...headers },
			params: useToLower(method) === 'get' ? { ...params } : undefined,
			body: useToLower(method) === 'post' ? params : undefined,
			onRequest({ request, options }) {
				const { headers }: any = options
				if (token) headers['Authorization'] = `Bearer ${token}`
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
				console.log('🚀 ~ file: clientRequest.ts:48 ~ onResponseError ~ request:', request)
			}
		})
	})
}
