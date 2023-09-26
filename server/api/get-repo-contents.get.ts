/*
 * @Author: iuukai
 * @Date: 2023-09-07 17:39:03
 * @LastEditors: iuukai
 * @LastEditTime: 2023-09-23 23:59:36
 * @FilePath: \iki-bookmark-nuxt3\server\api\get-repo-contents.get.ts
 * @Description:
 * @QQ/微信: 790331286
 */
import { H3Event } from 'h3'

export default defineEventHandler(async (event: H3Event) => {
	const query = getQuery(event)
	const { authorization } = getHeaders(event)
	const { type, owner, repo, path } = query

	const url =
		type === 'github'
			? `https://api.github.com/repos/${owner}/${repo}/contents${
					path ? '/' + encodeURIComponent(String(path)) : ''
			  }`
			: `https://gitee.com/api/v5/repos/${owner}/${repo}/contents${
					path ? '/' + encodeURIComponent(String(path)) : ''
			  }`
	return useServerRequest('get', url, query, authorization)
})
