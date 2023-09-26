/*
 * @Author: iuukai
 * @Date: 2023-09-01 20:36:51
 * @LastEditors: iuukai
 * @LastEditTime: 2023-09-23 02:26:07
 * @FilePath: \iki-bookmark-nuxt3\server\api\create-repo.post.ts
 * @Description:
 * @QQ/微信: 790331286
 */
import { H3Event } from 'h3'

export default defineEventHandler(async (event: H3Event) => {
	const body = await readBody(event)
	const { authorization } = getHeaders(event)
	const { type, ...params } = body
	const url =
		type === 'github' ? 'https://api.github.com/user/repos' : 'https://gitee.com/api/v5/user/repos'

	return useServerRequest('post', url, params, authorization)
})
