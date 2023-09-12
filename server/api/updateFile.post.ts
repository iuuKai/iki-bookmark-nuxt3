/*
 * @Author: iuukai
 * @Date: 2023-09-10 18:19:01
 * @LastEditors: iuukai
 * @LastEditTime: 2023-09-10 18:31:27
 * @FilePath: \iki-bookmark-nuxt3\server\api\updateFile.put.ts
 * @Description:
 * @QQ/微信: 790331286
 */
export default defineEventHandler(async event => {
	const body = await readBody(event)
	const { authorization } = getHeaders(event)
	const { type, owner, repo, path, ...params } = body
	const url =
		type === 'github'
			? `https://api.github.com/repos/${owner}/${repo}/contents/${path}`
			: `https://gitee.com/api/v5/repos/${owner}/${repo}/contents/${path}`

	return serverRequest('put', url, params, authorization)
})
