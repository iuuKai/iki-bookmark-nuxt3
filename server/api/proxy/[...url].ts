import { H3Event } from 'h3'

export default defineEventHandler(async (event: H3Event) => {
	const { url } = getRouterParams(event)
	const targetUrl = decodeURIComponent(url)

	try {
		const response: any = await $fetch.raw(targetUrl, {
			method: 'get',
			headers: {
				Accept: '*/*'
			},
			responseType: 'arrayBuffer'
		})

		const buffer = Buffer.from(response._data)
		setResponseHeader(event, 'Access-Control-Allow-Origin', '*')
		setResponseHeader(event, 'Cache-Control', 'public, max-age=31536000, immutable')
		setResponseHeader(event, 'Content-Type', response.headers.get('content-type') || 'image/png')
		setResponseHeader(event, 'Content-Length', buffer.length)
		setResponseHeader(event, 'Content-Security', "default-src 'none'")
		setResponseHeader(event, 'Content-Transfer-Encoding', 'binary')
		return buffer
	} catch {
		return event.node.res.writeHead(500).end('Error occurred while proxying the resource.')
	}
})
