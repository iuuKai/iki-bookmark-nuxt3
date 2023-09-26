/*
 * @Author: iuukai
 * @Date: 2023-09-22 22:47:17
 * @LastEditors: iuukai
 * @LastEditTime: 2023-09-23 11:48:51
 * @FilePath: \iki-bookmark-nuxt3\server\api\proxy\[...url].ts
 * @Description:
 * @QQ/微信: 790331286
 */
import { H3Event } from 'h3'

export default defineEventHandler(async (event: H3Event) => {
	const { url } = getRouterParams(event)
	const headers: any = {}
	try {
		const data: any = await $fetch(url, {
			method: 'get',
			headers: {
				Accept: 'application/json, text/plain, */*',
				'Content-Type': 'application/json; charset=utf-8'
			},
			responseType: 'arrayBuffer',
			async onResponse({ response }: any) {
				for (let [key, value] of response.headers) {
					headers[key] = value
				}
				return response._data
			}
		})
		// const buffer = Buffer.from(data, 'binary')
		// setResponseHeader(event, 'Access-Control-Allow-Origin', '*')
		// setResponseHeader(event, 'Cache-Control', 'public, max-age=31536000, immutable')
		// setResponseHeader(event, 'Content-Type', headers['content-type'])
		// setResponseHeader(event, 'Content-Length', buffer.length)
		// setResponseHeader(event, 'Content-Security', "default-src 'none'")
		// setResponseHeader(event, 'Content-Transfer-Encoding', 'binary')
		// return buffer

		const buffer = Buffer.from(data, 'base64')
		setResponseHeader(event, 'Access-Control-Allow-Origin', '*')
		setResponseHeader(event, 'Cache-Control', 'public, max-age=31536000, immutable')
		setResponseHeader(event, 'Content-Type', headers['content-type'])
		setResponseHeader(event, 'Content-Length', buffer.length)
		setResponseHeader(event, 'Content-Security', "default-src 'none'")
		setResponseHeader(event, 'Content-Transfer-Encoding', 'binary')
		return buffer
	} catch (error) {
		return event.node.res.writeHead(500, headers).end('Error occurred while proxying the resource.')
	}
})
