/*
 * @Author: iuukai
 * @Date: 2023-08-31 22:39:55
 * @LastEditors: iuukai
 * @LastEditTime: 2023-09-28 12:49:19
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

// https://cors-anywhere.azm.workers.dev/
export const useApiProxy = (url: string) => {
	const proxyUrl = '/api/proxy/' + url
	return useClientRequest({ url: proxyUrl })
}

// 获取网站信息
export const useApiGetWebContent = (params?: any) => {
	const url = '/api/get-web-content'
	return useClientRequest({ url, params })
}

// 获取 bilibili emoji
export const useApiGetBilibiliEmoji = (params?: any) => {
	const url = '/api/get-emoji'
	return useClientRequest({ url })
}

// 渲染 markdown 文本
export const useApiRenderMarkdown = (params?: any) => {
	const url = '/api/render-markdown'
	return useClientRequest({ url, method: 'post', params })
}

// 前往授权
export const useApiGetAuthorizeUrl = (params?: any) => {
	const url = '/api/get-oauth-authorize'
	return useClientRequest({ url, params })
}

// 获取 token
export const useApiGetOauthToken = (params?: any) => {
	const url = '/api/get-oauth-accessToken'
	return useClientRequest({ url, method: 'post', params })
}

// 获取用户信息
export const useApiGetUserInfo = (params?: any) => {
	const url = '/api/get-user-info'
	return useClientRequest({ url, params })
}

// 获取用户书签仓库
export const useApiGetBookmarkRepo = (params?: any) => {
	const url = '/api/get-repo'
	return useClientRequest({ url, params })
}

// 创建书签仓库
export const useApiCreateBookmarkRepo = (params?: any) => {
	const url = '/api/create-repo'
	return useClientRequest({ url, method: 'post', params })
}

// 获取仓库路径内容
export const useApiGetBookmarkContents = (params?: any) => {
	const url = '/api/get-repo-contents'
	return useClientRequest({ url, params })
}

// 新建文件
export const useApiCreateBookmarkFile = (params?: any) => {
	const url = '/api/create-file'
	return useClientRequest({ url, method: 'post', params })
}

// 删除文件
export const useApiDeleteBookmarkFile = (params?: any) => {
	const url = '/api/delete-file'
	return useClientRequest({ url, method: 'post', params })
}

// 更新文件
export const useApiUpdateBookmarkFile = (params?: any) => {
	const url = '/api/update-file'
	return useClientRequest({ url, method: 'post', params })
}

// 获取 issues
export const useApiGetIssues = (params?: any) => {
	const url = '/api/get-issues'
	return useClientRequest({ url, params })
}

// 通过 number获取 issue
export const useApiGetIssueByNumber = (params?: any) => {
	const url = '/api/get-an-issue'
	return useClientRequest({ url, params })
}

// 创建 issue
export const useApiCreateIssue = (params?: any) => {
	const url = '/api/create-an-issue'
	return useClientRequest({ url, method: 'post', params })
}

// 获取 issue 所有评论
export const useApiGetIssueComments = (params?: any) => {
	const url = '/api/get-issue-comments'
	return useClientRequest({ url, params })
}

// 创建 issue 评论
export const useApiCreateIssueComment = (params?: any) => {
	const url = '/api/create-issue-comment'
	return useClientRequest({ url, method: 'post', params })
}
