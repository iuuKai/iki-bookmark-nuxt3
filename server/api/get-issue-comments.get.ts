/*
 * @Author: iuukai
 * @Date: 2023-09-19 22:45:12
 * @LastEditors: iuukai
 * @LastEditTime: 2023-09-23 02:27:55
 * @FilePath: \iki-bookmark-nuxt3\server\api\get-issue-comments.get.ts
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
			? `https://api.github.com/repos/${owner}/${repo}/issues/${number}/comments`
			: `https://gitee.com/api/v5/repos/${owner}/${repo}/issues/${number}/comments`

	return useServerRequest('get', url, query, authorization)
})
