/*
 * @Author: iuukai
 * @Date: 2023-09-01 15:40:30
 * @LastEditors: iuukai
 * @LastEditTime: 2023-09-23 02:29:07
 * @FilePath: \iki-bookmark-nuxt3\server\api\get-repo.get.ts
 * @Description:
 * @QQ/微信: 790331286
 */
import { H3Event } from 'h3'

export default defineEventHandler(async (event: H3Event) => {
	const query = getQuery(event)
	const { authorization } = getHeaders(event)
	const { type, owner, repo } = query
	const url =
		type === 'github'
			? `https://api.github.com/repos/${owner}/${repo}`
			: `https://gitee.com/api/v5/repos/${owner}/${repo}`

	return useServerRequest('get', url, query, authorization)
})
