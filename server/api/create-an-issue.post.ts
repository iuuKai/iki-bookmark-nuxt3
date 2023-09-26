/*
 * @Author: iuukai
 * @Date: 2023-09-19 20:11:06
 * @LastEditors: iuukai
 * @LastEditTime: 2023-09-26 21:22:07
 * @FilePath: \iki-bookmark-nuxt3\server\api\create-an-issue.post.ts
 * @Description:
 * @QQ/微信: 790331286
 */
import { H3Event } from 'h3'

export default defineEventHandler(async (event: H3Event) => {
	const body = await readBody(event)
	const { authorization } = getHeaders(event)
	const { type, owner, repo, labels } = body
	body.labels = type === 'github' ? labels : labels.join(',')
	const url =
		type === 'github'
			? `https://api.github.com/repos/${owner}/${repo}/issues`
			: `https://gitee.com/api/v5/repos/${owner}/issues`

	return useServerRequest('post', url, body, authorization)
})
