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
	if (type && !params.type) params.type = type

	return new Promise((resolve, reject) => {
		let settled = false
		const safeResolve = (data: any) => {
			if (settled) return
			settled = true
			resolve(data)
		}
		const safeReject = (error: any) => {
			if (settled) return
			settled = true
			reject(error)
		}

		useFetch(url, {
			key: `${String(url)}-${Date.now()}`,
			method,
			headers: { ...headers },
			timeout: 15000,
			onRequest({ options }: any) {
				if (token) options.headers.Authorization = `Bearer ${token}`
				options[isGET ? 'params' : 'body'] = params
			},
			onRequestError({ error }) {
				safeReject(error || new Error('request failed'))
			},
			onResponse({ response }) {
				console.log('useClientRequest onResponse:', response)
				safeResolve(response._data)
			},
			onResponseError({ request, response }) {
				console.log('useClientRequest onResponseError:', request)
				safeReject(response?._data || new Error(response?.statusText || 'response failed'))
			}
		})
	})
}
