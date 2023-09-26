/*
 * @Author: iuukai
 * @Date: 2023-09-11 01:18:08
 * @LastEditors: iuukai
 * @LastEditTime: 2023-09-25 00:47:19
 * @FilePath: \iki-bookmark-nuxt3\utils\custom-function.ts
 * @Description:
 * @QQ/微信: 790331286
 */
import cryptoRandomString from 'crypto-random-string'

export const useGenerateId = (length: number = 16) => cryptoRandomString({ length })

export const useCopy = (text: string) => {
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
