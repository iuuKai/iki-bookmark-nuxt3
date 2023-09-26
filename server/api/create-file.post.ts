/*
 * @Author: iuukai
 * @Date: 2023-09-02 13:15:08
 * @LastEditors: iuukai
 * @LastEditTime: 2023-09-22 23:07:41
 * @FilePath: \iki-bookmark-nuxt3\server\api\create-file.post.ts
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

	return useServerRequest(type === 'github' ? 'put' : 'post', url, params, authorization)
})
