export default defineEventHandler(async event => {
	const body = await readBody(event)
	const { authorization } = getHeaders(event)
	const { type, ...params } = body
	const url =
		type === 'github' ? 'https://api.github.com/user/repos' : 'https://gitee.com/api/v5/user/repos'

	return serverRequest('post', url, params, authorization)
})
