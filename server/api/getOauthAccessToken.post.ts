/*
 * @Author: iuukai
 * @Date: 2023-08-28 10:41:09
 * @LastEditors: iuukai
 * @LastEditTime: 2023-09-01 13:40:28
 * @FilePath: \iki-bookmark-nuxt3\server\api\getOauthAccessToken.post.ts
 * @Description:
 * @QQ/微信: 790331286
 */
import config from '../config'

interface Authorize {
	redirect_uri: string
	code: string
	type: 'github' | 'gitee'
}

export default defineEventHandler(async event => {
	const mode = process.env.NODE_ENV === 'production' ? 'build' : 'dev'
	const { type, code, redirect_uri }: Authorize = await readBody(event)
	const body = {
		redirect_uri,
		code,
		client_id: config[mode][type]['client_id'],
		client_secret: config[mode][type]['client_secret'],
		grant_type: 'authorization_code'
	}
	const url =
		type === 'github'
			? 'https://github.com/login/oauth/access_token'
			: 'https://gitee.com/oauth/token'

	return serverRequest('post', url, body)
})
