/*
 * @Author: iuukai
 * @Date: 2023-08-31 22:39:55
 * @LastEditors: iuukai
 * @LastEditTime: 2023-09-11 23:12:04
 * @FilePath: \iki-bookmark-nuxt3\composables\api.ts
 * @Description:
 * @QQ/微信: 790331286
 */
interface ClientResponse {
	code: number
	data: any
	msg: string
	targetURL?: string
}

// 获取网站信息
export const useApiGetWebContent = (website: string) => {
	const url = 'https://get-web-content.onrender.com'
	return new Promise((resolve, reject) => {
		useFetch(url, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ url: website }),
			onResponse({ request, response, options }) {
				resolve(response._data)
			}
		})
	})
}

// 前往授权
export const useApiGetAuthorizeUrl = (params?: any) => {
	const url = '/api/getOauthAuthorize'
	return clientRequest({ url, params })
}

// 获取 token
export const useApiGetOauthToken = (params?: any) => {
	const url = '/api/getOauthAccessToken'
	return clientRequest({ url, method: 'post', params })
}

// 获取用户信息
export const useApiGetUserInfo = (params?: any) => {
	const url = '/api/getUserInfo'
	return clientRequest({ url, params })
}

// 获取用户书签仓库
export const useApiGetBookmarkRepo = (params?: any) => {
	const url = '/api/getRepo'
	return clientRequest({ url, params })
}

// 创建书签仓库
export const useApiCreateBookmarkRepo = (params?: any) => {
	const url = '/api/createRepo'
	return clientRequest({ url, method: 'post', params })
}

// 获取仓库路径内容
export const useApiGetBookmarkContents = (params?: any) => {
	const url = '/api/getRepoContents'
	return clientRequest({ url, params })
}

// 新建文件
export const useApiCreateBookmarkFile = (params?: any) => {
	const url = '/api/createFile'
	return clientRequest({ url, method: 'post', params })
}

// 更新文件
export const useApiUpdateBookmarkFile = (params?: any) => {
	const url = '/api/updateFile'
	return clientRequest({ url, method: 'post', params })
}
