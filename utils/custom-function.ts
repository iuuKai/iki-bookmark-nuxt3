/*
 * @Author: iuukai
 * @Date: 2023-09-11 01:18:08
 * @LastEditors: iuukai
 * @LastEditTime: 2023-09-15 03:42:12
 * @FilePath: \iki-bookmark-nuxt3\utils\custom-function.ts
 * @Description:
 * @QQ/微信: 790331286
 */
import cryptoRandomString from 'crypto-random-string'

export const generateId = (length: number = 16) => cryptoRandomString({ length })

export const copy = (text: string) => {
	return new Promise((resolve, reject) => {
		navigator.clipboard
			.writeText(text)
			.then(() => {
				resolve([null, { code: 200, message: '复制成功' }])
			})
			.catch(() => {
				resolve([{ code: 500, message: '复制失败' }, null])
			})
	})
}

export const transformAbsolutePath = (_url: string, _relativepath: string) => {
	let absolutePath = ''
	try {
		if (/^\/\//.test(_relativepath) || new URL(_relativepath)) absolutePath = _relativepath
	} catch {
		const url = new URL(_url)
		const pathname = url.pathname
		const pathnameArr = pathname.split('/')
		const relativepathArr = _relativepath.split('/')
		let newUrl = ''
		if (/^\.\.\//.test(_relativepath)) {
			const relativepathFilterArr = relativepathArr.filter(s => s !== '..')
			const count = relativepathArr.length - relativepathFilterArr.length
			const pathnameSliceArr = pathnameArr.slice(0, pathnameArr.length - count)
			newUrl = pathnameSliceArr.concat(relativepathFilterArr).join('/')
		} else if (/^\/[^\/]/.test(_relativepath)) {
			newUrl = _relativepath
		} else {
			const relativepathFilterArr = relativepathArr.filter(s => s !== '.')
			newUrl = pathnameArr.concat(relativepathFilterArr).join('/')
		}
		absolutePath = url.origin + newUrl
	} finally {
		return absolutePath
	}
}
