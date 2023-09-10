/*
 * @Author: iuukai
 * @Date: 2023-09-07 17:39:03
 * @LastEditors: iuukai
 * @LastEditTime: 2023-09-07 18:53:13
 * @FilePath: \iki-bookmark-nuxt3\server\api\getRepoContents.get.ts
 * @Description:
 * @QQ/微信: 790331286
 */
export default defineEventHandler(async event => {
	const query = getQuery(event)
	const { authorization } = getHeaders(event)
	const { type, owner, repo, path } = query
	const url =
		type === 'github'
			? `https://api.github.com/repos/${owner}/${repo}/contents${
					path ? '/' + encodeURIComponent(String(path)) : ''
			  }`
			: `https://gitee.com/api/v5/repos/${owner}/${repo}/contents${
					path ? '/' + encodeURIComponent(String(path)) : ''
			  }`
	return serverRequest('get', url, query, authorization)
})
