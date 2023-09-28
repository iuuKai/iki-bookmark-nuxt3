/*
 * @Author: iuukai
 * @Date: 2023-09-28 08:57:35
 * @LastEditors: iuukai
 * @LastEditTime: 2023-09-28 14:02:55
 * @FilePath: \iki-bookmark-nuxt3\assets\workers\index.ts
 * @Description:
 * @QQ/微信: 790331286
 */
self.addEventListener('message', async (e: MessageEvent) => {
	const { url } = e.data
	const body = {
		code: 500,
		msg: '',
		url: ''
	}
	try {
		const res = await fetch('/api/proxy/' + url).then(r => {
			if (!r.ok) throw new Error(r.statusText)
			return r.blob()
		})
		body.code = 200
		body.msg = 'success'
		body.url = URL.createObjectURL(res)
	} catch (error: any) {
		body.code = 500
		body.msg = error.message
		body.url = ''
	} finally {
		self.postMessage(body)
	}
})

export default {}
