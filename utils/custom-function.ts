import cryptoRandomString from 'crypto-random-string'

export const getId = (length: number = 16) => cryptoRandomString({ length })

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
