/*
 * @Author: iuukai
 * @Date: 2023-08-30 00:49:07
 * @LastEditors: iuukai
 * @LastEditTime: 2023-09-23 02:29:15
 * @FilePath: \iki-bookmark-nuxt3\server\api\get-user-info.get.ts
 * @Description:
 * @QQ/微信: 790331286
 */
import { H3Event } from 'h3'

export default defineEventHandler(async (event: H3Event) => {
	const query = getQuery(event)
	const { authorization } = getHeaders(event)
	const { type } = query
	const url = type === 'github' ? 'https://api.github.com/user' : 'https://gitee.com/api/v5/user'

	return useServerRequest('get', url, {}, authorization)
})
