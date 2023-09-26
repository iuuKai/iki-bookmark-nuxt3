/*
 * @Author: iuukai
 * @Date: 2023-09-06 13:32:20
 * @LastEditors: iuukai
 * @LastEditTime: 2023-09-20 11:16:45
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
	params: any
	result: any[]
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

const filterReadme = async (params: { path: string; data: any }) => {
	try {
		const p = 'README.en.md'
		await repoStore.apiGetRepoFileData({ path: params.path })
		await repoStore.apiUpdateRepoFileData(params)
		if (userStore.type === 'gitee') {
			await repoStore.apiGetRepoFileData({ path: p })
			await repoStore.apiDeleteRepoFileData({ path: p })
		}
		return Promise.resolve()
	} catch (error) {
		return Promise.reject(error)
	}
}

const repoFilesParams = initRepoFile.map(path => {
	const k = Object.keys(templateModels).find(
		k =>
			/\/([^\/]*)\.ts$/.exec(k)?.[1]?.replace('_', '/')?.toLocaleLowerCase() ===
			path.toLocaleLowerCase()
	)
	return {
		path,
		data: templateModels[k as string]
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
			private: true,
			auto_init: true
		},
		result: []
	},
	...repoFilesParams.map(item => ({
		value: item.path,
		label: item.path,
		request: repoStore.apiCreateRepoFileData,
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
		if (/readme/i.test(curRequest.value)) {
			await filterReadme(curRequest.params)
		} else {
			await curRequest.request(curRequest.params)
			// 创建配置文件后，获取
			if (/^config/.test(curRequest.label)) {
				await repoStore.apiGetConfigData()
			}
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
