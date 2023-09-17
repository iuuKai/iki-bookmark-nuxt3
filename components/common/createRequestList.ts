/*
 * @Author: iuukai
 * @Date: 2023-09-06 13:32:20
 * @LastEditors: iuukai
 * @LastEditTime: 2023-09-16 14:36:55
 * @FilePath: \iki-bookmark-nuxt3\components\common\createRequestList.ts
 * @Description:
 * @QQ/微信: 790331286
 */
import { useUserStore } from '@/store/modules/user'
import { useRepoStore } from '@/store/modules/repo'

export interface RequestObject {
	value: string
	label: string
	required?: boolean
	request: typeof useApiCreateBookmarkRepo | typeof useApiCreateBookmarkFile
	params: object
	result: object[]
}

export interface Result {
	value: string
	label: string
	state: number
	required?: boolean
}

const userStore = useUserStore()
const repoStore = useRepoStore()
const templateModels = import.meta.glob('@/assets/init-create-template/*.ts', {
	eager: true,
	import: 'default'
})
const initRepoFile = repoStore.initRepoFile

const repoFilesParams = initRepoFile.map(path => {
	const k = Object.keys(templateModels).find(
		k =>
			/\/([^\/]*)\.ts$/.exec(k)?.[1]?.replace('_', '/')?.toLocaleLowerCase() ===
			path.toLocaleLowerCase()
	)

	return {
		path,
		content: Base64.enc(templateModels[k as string]),
		// content: templateModels[k as string],	// 无 base64 会创建失败
		owner: userStore.loginName,
		repo: 'my-bookmarks',
		message: 'iBookmark: init private repo'
	}
})

export const getResponseList = (): RequestObject[] => [
	{
		value: 'repo',
		label: '仓库',
		required: true,
		request: useApiCreateBookmarkRepo,
		params: {
			name: 'my-bookmarks',
			description: '我的私人书签',
			private: true
		},
		result: []
	},
	...repoFilesParams.map(item => ({
		value: item.path,
		label: item.path,
		request: useApiCreateBookmarkFile,
		params: item,
		result: []
	}))
]

// 队列，依次先进先出执行，前者未完成后者不会执行
export const requestQueue = async (
	callback: (isDone: boolean) => void,
	requests: RequestObject[],
	results: Result[]
) => {
	if (!requests || !results || !results) return callback(false)
	if (isEmpty(requests)) {
		return callback(true)
	}
	const curRequest = requests.shift() as RequestObject
	results.push({
		required: curRequest.required ?? false,
		value: curRequest.value,
		label: curRequest.label,
		state: 0
	})
	const curResult = results.find(
		({ label }: { label: string }) => label === curRequest.label
	) as Result
	try {
		const { code, statusCode, statusMessage, message, data }: any = await curRequest.request(
			curRequest.params
		)
		if (code !== 200) throw new Error(message || statusMessage || statusCode)
		// 创建配置文件后，获取
		if (/^config/.test(curRequest.label)) {
			await repoStore.apiGetConfigData()
		}
		curResult.state = 1
	} catch (error) {
		curResult.state = -1
	} finally {
		// 如果是必须请求，那么失败则不会继续后面执行
		if (curRequest.required && curResult.state === -1) return callback(false)
		requestQueue(callback, requests, results)
	}
}
