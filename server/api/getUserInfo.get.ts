/*
 * @Author: iuukai
 * @Date: 2023-08-30 00:49:07
 * @LastEditors: iuukai
 * @LastEditTime: 2023-09-01 15:49:40
 * @FilePath: \iki-bookmark-nuxt3\server\api\getUserInfo.get.ts
 * @Description:
 * @QQ/微信: 790331286
 */

export default defineEventHandler(async event => {
	const query = getQuery(event)
	const { authorization } = getHeaders(event)
	const { type } = query
	const url = type === 'github' ? 'https://api.github.com/user' : 'https://gitee.com/api/v5/user'

	return serverRequest('get', url, {}, authorization)
})
