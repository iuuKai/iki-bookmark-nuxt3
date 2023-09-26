/*
 * @Author: iuukai
 * @Date: 2023-09-25 05:07:33
 * @LastEditors: iuukai
 * @LastEditTime: 2023-09-25 05:10:34
 * @FilePath: \iki-bookmark-nuxt3\server\api\create-issue-comment.post.ts
 * @Description:
 * @QQ/微信: 790331286
 */
import { H3Event } from 'h3'

export default defineEventHandler(async (event: H3Event) => {
	const body = await readBody(event)
	const { authorization } = getHeaders(event)
	const { type, owner, repo, number } = body
	const url =
		type === 'github'
			? `https://api.github.com/repos/${owner}/${repo}/issues/${number}/comments`
			: `https://gitee.com/api/v5/repos/${owner}/${repo}/issues/${number}/comments`

	return useServerRequest('post', url, body, authorization)
})
