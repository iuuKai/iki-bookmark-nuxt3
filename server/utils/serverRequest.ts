/*
 * @Author: iuukai
 * @Date: 2023-08-31 00:46:49
 * @LastEditors: iuukai
 * @LastEditTime: 2023-09-13 03:16:16
 * @FilePath: \iki-bookmark-nuxt3\server\utils\serverRequest.ts
 * @Description:
 * @QQ/微信: 790331286
 */

export const serverRequest = (method: string, url: string, data: any, token?: string) => {
	const tu = new URL(url)
	const targetURL = tu.origin + tu.pathname
	const isGET = method.toLowerCase() === 'get'

	return $fetch(url, {
		method,
		headers: { Accept: 'application/json' },
		params: isGET ? { ...data } : undefined,
		// body: method.toLowerCase() === 'post' ? new URLSearchParams(data).toString() : undefined,
		body: !isGET ? data : undefined,
		onRequest({ request, options }: any) {
			const { headers }: any = options
			if (token) headers['Authorization'] = token
			if (url.includes('api.github.com')) headers['Accept'] = 'application/vnd.github.v3+json'
			// if (method.toLowerCase() === 'post')
			// 	headers['Content-Type'] = 'application/x-www-form-urlencoded'
		}
	})
		.then((res: any) => {
			if (res.error || res.error_description) throw res
			return {
				code: 200,
				message: res.statusText ?? res.statusMessage,
				targetURL,
				data: res
			}
		})
		.catch((err: any) => {
			console.log('serverRequest❌:', err)
			// return {
			// 	code: err.status ?? err.statusCode ?? 502,
			// 	msg:
			// 		err.statusText ?? err.statusMessage ?? err.error_description ?? err.error ?? err.message,
			// 	targetURL,
			// 	data: null
			// }
			// if ((err.status ?? err.statusCode) === 404)
			throw createError({
				statusCode: err.status ?? err.statusCode ?? 502,
				statusMessage:
					err.statusText ?? err.statusMessage ?? err.error_description ?? err.error ?? err.message
			})
		})
}
