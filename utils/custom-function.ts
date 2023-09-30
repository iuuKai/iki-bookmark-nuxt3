/*
 * @Author: iuukai
 * @Date: 2023-09-11 01:18:08
 * @LastEditors: iuukai
 * @LastEditTime: 2023-09-30 11:40:19
 * @FilePath: \iki-bookmark-nuxt3\utils\custom-function.ts
 * @Description:
 * @QQ/微信: 790331286
 */
import cryptoRandomString from 'crypto-random-string'
import { useRepoStore } from '@/store/modules/repo'
import { dayjs } from 'element-plus'

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

export const configLogData = ({
	path,
	total = 0,
	add = 0,
	del = 0
}: {
	path: string
	total: number
	add?: number
	del?: number
}) => {
	const cloneConfig = JSON.parse(JSON.stringify(useRepoStore().CONFIG))
	const log = cloneConfig.log
	const curDate = dayjs().format('YYYY-MM-DD')

	if (log && log[path]) {
		log[path][curDate] = {
			total,
			add: (log[path][curDate]?.add ?? 0) + add,
			del: (log[path][curDate]?.del ?? 0) + del
		}
	} else {
		;(log ?? ((cloneConfig.log = {}) && cloneConfig.log))[path] = {
			[curDate]: {
				total,
				add,
				del
			}
		}
	}

	return { ...cloneConfig }
}
