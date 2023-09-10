/*
 * @Author: iuukai
 * @Date: 2023-08-31 22:39:55
 * @LastEditors: iuukai
 * @LastEditTime: 2023-09-07 21:26:41
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

// 新建文件
export const useApiCreateBookmarkFile = (params?: any) => {
	const url = '/api/createFile'
	return clientRequest({ url, method: 'post', params })
}

// 获取仓库路径内容
export const useApiGetBookmarkContents = (params?: any) => {
	const url = '/api/getRepoContents'
	return clientRequest({ url, params })
}
