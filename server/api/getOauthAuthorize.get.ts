/*
 * @Author: iuukai
 * @Date: 2023-08-28 10:12:13
 * @LastEditors: iuukai
 * @LastEditTime: 2023-09-02 02:12:46
 * @FilePath: \iki-bookmark-nuxt3\server\api\getOauthAuthorize.get.ts
 * @Description:
 * @QQ/微信: 790331286
 */
import config from '../config'

interface Authorize {
	redirect_uri: string
	type: 'github' | 'gitee'
}

export default defineEventHandler(event => {
	return new Promise((resolve, reject) => {
		const mode = process.env.NODE_ENV === 'production' ? 'build' : 'dev'
		const { type, redirect_uri }: Authorize = getQuery(event)

		if (redirect_uri && type) {
			const client_id = config[mode][type]['client_id']
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
