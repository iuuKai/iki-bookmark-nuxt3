/*
 * @Author: iuukai
 * @Date: 2023-09-19 20:28:06
 * @LastEditors: iuukai
 * @LastEditTime: 2023-09-23 02:27:36
 * @FilePath: \iki-bookmark-nuxt3\server\api\get-an-issue.get.ts
 * @Description:
 * @QQ/微信: 790331286
 */
import { H3Event } from 'h3'

export default defineEventHandler(async (event: H3Event) => {
	const query = getQuery(event)
	const { authorization } = getHeaders(event)
	const { type, owner, repo, number } = query
	const url =
		type === 'github'
			? `https://api.github.com/repos/${owner}/${repo}/issues/${number}`
			: `https://gitee.com/api/v5/repos/${owner}/${repo}/issues/${number}`

	return useServerRequest('get', url, query, authorization)
})
