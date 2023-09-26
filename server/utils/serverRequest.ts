/*
 * @Author: iuukai
 * @Date: 2023-08-31 00:46:49
 * @LastEditors: iuukai
 * @LastEditTime: 2023-09-24 19:05:36
 * @FilePath: \iki-bookmark-nuxt3\server\utils\serverRequest.ts
 * @Description:
 * @QQ/微信: 790331286
 */
import parseLinkHeader from 'parse-link-header'

interface Answer {
	status: number
	body: AnswerBody
}
interface AnswerBody {
	meta: {
		code: number
		msg: string
		targetURL: string
		total?: number
	}
	data: any
}

export const useServerRequest = (
	method: string | any,
	url: string,
	data: any = {},
	token: string = ''
) => {
	const tu = new URL(url)
	const targetURL = tu.origin + tu.pathname
	const isGET = method.toLowerCase() === 'get'
	const answer: Answer = { status: 500, body: {} as AnswerBody }

	return new Promise((resolve, reject) => {
		$fetch(url, {
			key: url + Date.now(),
			method,
			headers: {},
			timeout: 15000,
			// 失败后，不自动重复发送
			// autoRetry: false,
			onRequest({ request, options }: any) {
				const { headers }: any = options
				if (data['x_user_agent']) headers['user-agent'] = data['x_user_agent']
				else headers['Accept'] = 'application/json'
				if (data['x_response_type']) options.responseType = data['x_response_type']
				if (token) headers['Authorization'] = token
				if (url.includes('api.github.com')) headers['Accept'] = 'application/vnd.github.v3+json'

				delete data['x_user_agent']
				delete data['x_response_type']
				options[isGET ? 'params' : 'body'] = data

				// if (method.toLowerCase() === 'post')
				// 	headers['Content-Type'] = 'application/x-www-form-urlencoded'
			},
			onResponse({ response }: any) {
				const to200 = response.status === 201 ? 200 : response.status
				answer.body = {
					meta: { code: to200, msg: response.statusText, targetURL },
					data: response._data
				}
				answer.status = to200

				if (response.headers.get('total_count')) {
					answer.body.meta.total = Number(response.headers.get('total_count'))
				} else {
					if (response.headers.get('link')) {
						const link = removeQuotes(parseLinkHeader(response.headers.get('link')))
						if (link?.last?.per_page && link.last.per_page / 1 === 1)
							answer.body.meta.total = Number(link.last.page)
					}
				}

				if (answer.status === 200) resolve(answer.body)
				else
					reject({
						statusCode: answer.status,
						statusMessage: response.statusText,
						message: response.statusText
					})
			},
			onRequestError({ error }) {
				reject({
					statusCode: 500,
					statusMessage: error.message,
					message: error.message
				})
			},
			onResponseError({ response }) {}
		})
	})
}
