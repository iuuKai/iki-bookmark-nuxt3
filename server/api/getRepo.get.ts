/*
 * @Author: iuukai
 * @Date: 2023-09-01 15:40:30
 * @LastEditors: iuukai
 * @LastEditTime: 2023-09-01 20:37:21
 * @FilePath: \iki-bookmark-nuxt3\server\api\getUserRepo.get.ts
 * @Description:
 * @QQ/微信: 790331286
 */
export default defineEventHandler(async event => {
	const query = getQuery(event)
	const { authorization } = getHeaders(event)
	const { type, owner, repo } = query
	const url =
		type === 'github'
			? `https://api.github.com/repos/${owner}/${repo}`
			: `https://gitee.com/api/v5/repos/${owner}/${repo}`

	return serverRequest('get', url, query, authorization)
})
