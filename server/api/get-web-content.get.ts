/*
 * @Author: iuukai
 * @Date: 2023-09-21 07:23:30
 * @LastEditors: iuukai
 * @LastEditTime: 2023-09-28 22:58:43
 * @FilePath: \iki-bookmark-nuxt3\server\api\get-web-content.get.ts
 * @Description:
 * @QQ/微信: 790331286
 */
import { H3Event } from 'h3'
import jsdom from 'jsdom'

export default defineEventHandler(async (event: H3Event) => {
	const { url } = getQuery(event)
	const headers = getHeaders(event)

	return new Promise((resolve, reject) => {
		useServerRequest('get', url, {
			x_user_agent: headers['user-agent'],
			x_response_type: 'text'
		})
			.then(async (res: any) => {
				if (res.meta.code === 200) {
					const { JSDOM } = jsdom
					const dom = new JSDOM(res.data)
					const $ = dom.window.document
					const title = $.querySelector('title')?.textContent ?? url
					const icon_url = $.querySelector('link[rel~="icon"]')?.getAttribute('href') ?? ''
					const description =
						$.querySelector('meta[name="description"]')?.getAttribute('content') ?? ''

					let icon: string = ''
					try {
						if (icon_url) throw null
						const origin = new URL(url).origin.replace(/\/$/, '')
						const iconURL = origin + '/favicon.ico'
						await $fetch(iconURL)
						icon = iconURL
					} catch {
						icon = icon_url ?? ''
					}

					res.data = {
						url,
						title,
						icon: useTransformAbsolutePath(url, icon),
						description
					}
				}
				resolve(res)
			})
			.catch((err: any) => reject(err))
	})
})
