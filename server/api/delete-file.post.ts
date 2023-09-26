/*
 * @Author: iuukai
 * @Date: 2023-09-20 07:36:42
 * @LastEditors: iuukai
 * @LastEditTime: 2023-09-23 02:30:01
 * @FilePath: \iki-bookmark-nuxt3\server\api\delete-file.post.ts
 * @Description:
 * @QQ/微信: 790331286
 */
import { H3Event } from 'h3'

export default defineEventHandler(async (event: H3Event) => {
	const body = await readBody(event)
	const { authorization } = getHeaders(event)
	const { type, owner, repo, path, ...params } = body
	const url =
		type === 'github'
			? `https://api.github.com/repos/${owner}/${repo}/contents/${path}`
			: `https://gitee.com/api/v5/repos/${owner}/${repo}/contents/${path}`

	return useServerRequest('delete', url, params, authorization)
})
