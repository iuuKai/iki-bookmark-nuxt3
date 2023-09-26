/*
 * @Author: iuukai
 * @Date: 2023-09-20 04:58:57
 * @LastEditors: iuukai
 * @LastEditTime: 2023-09-25 01:07:09
 * @FilePath: \iki-bookmark-nuxt3\server\utils\custom-function.ts
 * @Description:
 * @QQ/微信: 790331286
 */
// 移除对象里 key 或者 value 字符串里多余的引号
export const removeQuotes = (obj: any) => {
	if (typeof obj !== 'object') {
		// 如果不是对象，直接返回
		return obj
	}
	for (let key in obj) {
		// 处理键名
		let newKey = key.replace(/(^')|('$)/g, '')

		// 如果是字符串，处理字符串里的引号
		if (typeof obj[key] === 'string') {
			obj[newKey] = obj[key].replace(/(^')|('$)/g, '')
		} else {
			// 如果不是字符串，递归继续处理
			obj[newKey] = removeQuotes(obj[key])
		}

		// 如果键名有变化，删除原来的键值对
		if (newKey !== key) {
			delete obj[key]
		}
	}
	return obj
}

export const useTransformAbsolutePath = (_url: string, _relativepath: string) => {
	if (!_relativepath) return _relativepath
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
