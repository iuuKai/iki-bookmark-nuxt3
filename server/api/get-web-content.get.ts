import { H3Event } from 'h3'
import jsdom from 'jsdom'

export default defineEventHandler(async (event: H3Event) => {
	const { url } = getQuery(event)
	const headers = getHeaders(event)
	const targetUrl = String(url ?? '').trim()
	const res: any = await useServerRequest('get', targetUrl, {
		x_user_agent: headers['user-agent'],
		x_response_type: 'text'
	})

	if (res.meta.code !== 200) return res

	const { JSDOM } = jsdom
	const dom = new JSDOM(res.data)
	const document = dom.window.document
	const title = (document.querySelector('title')?.textContent ?? targetUrl).trim()
	const description =
		document.querySelector('meta[name="description"]')?.getAttribute('content') ??
		document.querySelector('meta[property="og:description"]')?.getAttribute('content') ??
		''

	res.data = {
		url: targetUrl,
		title,
		icon: resolveWebsiteIcon(targetUrl, document),
		description
	}

	return res
})

const resolveWebsiteIcon = (url: string, document: Document) => {
	const selectors = [
		'link[rel="icon"]',
		'link[rel="shortcut icon"]',
		'link[rel="apple-touch-icon"]',
		'link[rel="apple-touch-icon-precomposed"]',
		'link[rel*="icon"]'
	]

	for (const selector of selectors) {
		const href = (document.querySelector(selector)?.getAttribute('href') ?? '').trim()
		const icon = useTransformAbsolutePath(url, href)
		if (icon) return icon
	}

	try {
		return new URL('/favicon.ico', url).toString()
	} catch {
		return ''
	}
}
