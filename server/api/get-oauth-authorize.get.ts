/*
 * @Author: iuukai
 * @Date: 2023-08-28 10:12:13
 * @LastEditors: iuukai
 * @LastEditTime: 2023-09-22 21:49:25
 * @FilePath: \iki-bookmark-nuxt3\server\api\get-oauth-authorize.get.ts
 * @Description:
 * @QQ/微信: 790331286
 */
import { H3Event } from 'h3'

interface Authorize {
	redirect_uri: string
	type: Type
}

export default defineEventHandler(async (event: H3Event) => {
	return new Promise((resolve, reject) => {
		const host = getRequestHost(event)
		const { type, redirect_uri }: Authorize = getQuery(event)
		const { client_id } = useGitConfig(host, type)

		if (redirect_uri && type) {
			const url =
				type == 'github'
					? `https://github.com/login/oauth/authorize?client_id=${client_id}&redirect_uri=${redirect_uri}&scope=${encodeURIComponent(
							'user repo'
					  )}`
					: `https://gitee.com/oauth/authorize?client_id=${client_id}&redirect_uri=${encodeURIComponent(
							redirect_uri
					  )}&response_type=code`
			const tu = new URL(url)
			const targetURL = tu.origin + tu.pathname
			resolve({
				data: {
					url
				},
				code: 200,
				msg: 'OK',
				targetURL
			})
		} else {
			reject({
				data: null,
				code: 400,
				msg: '缺少请求参数!'
			})
		}
	})
})
