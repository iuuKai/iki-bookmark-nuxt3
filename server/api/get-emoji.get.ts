/*
 * @Author: iuukai
 * @Date: 2023-09-21 06:57:04
 * @LastEditors: iuukai
 * @LastEditTime: 2023-09-23 02:27:45
 * @FilePath: \iki-bookmark-nuxt3\server\api\get-emoji.get.ts
 * @Description:
 * @QQ/微信: 790331286
 */
import { H3Event } from 'h3'

export default defineEventHandler(async (event: H3Event) => {
	const url = 'https://api.bilibili.com/x/emote/user/panel/web'
	return new Promise((resolve, reject) => {
		useServerRequest('get', url, { business: 'reply' })
			.then((res: any) => {
				const { data } = res.data
				res.data = data?.packages ?? []

				resolve(res)
			})
			.catch((err: any) => reject(err))
	})
})
