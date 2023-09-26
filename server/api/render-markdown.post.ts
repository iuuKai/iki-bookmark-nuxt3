/*
 * @Author: iuukai
 * @Date: 2023-09-21 22:41:52
 * @LastEditors: iuukai
 * @LastEditTime: 2023-09-21 22:43:14
 * @FilePath: \iki-bookmark-nuxt3\server\api\render-markdown.post.ts
 * @Description:
 * @QQ/微信: 790331286
 */
import { H3Event } from 'h3'

export default defineEventHandler(async (event: H3Event) => {
	const body = await readBody(event)
	const { authorization } = getHeaders(event)
	const { type, ...params } = body
	const url =
		type === 'github' ? 'https://api.github.com/markdown' : 'https://gitee.com/api/v5/markdown'
	return useServerRequest('post', url, params, authorization)
})
