/*
 * @Author: iuukai
 * @Date: 2023-08-28 10:41:09
 * @LastEditors: iuukai
 * @LastEditTime: 2023-09-22 21:49:08
 * @FilePath: \iki-bookmark-nuxt3\server\api\get-oauth-accessToken.post.ts
 * @Description:
 * @QQ/微信: 790331286
 */
import { H3Event } from 'h3'

interface Authorize {
	redirect_uri: string
	code: string
	type: Type
}

export default defineEventHandler(async (event: H3Event) => {
	const host = getRequestHost(event)
	const { type, code, redirect_uri }: Authorize = await readBody(event)
	const { client_id, client_secret } = useGitConfig(host, type)
	const body = {
		redirect_uri,
		code,
		client_id,
		client_secret,
		grant_type: 'authorization_code'
	}
	const url =
		type === 'github'
			? 'https://github.com/login/oauth/access_token'
			: 'https://gitee.com/oauth/token'

	return useServerRequest('post', url, body)
})
