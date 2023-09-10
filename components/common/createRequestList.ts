import { useUserStore } from '@/store/modules/user'
import { useRepoStore } from '@/store/modules/repo'

export interface RequestObject {
	name: string
	required?: boolean
	request: typeof useApiCreateBookmarkRepo | typeof useApiCreateBookmarkFile
	params: object
	result: object[]
}

export interface Result {
	name: string
	state: number
}

const userStore = useUserStore()
const repoStore = useRepoStore()
const templateModels = import.meta.glob('@/assets/init-create-template/*.ts')
const initRepoFile = repoStore.initRepoFile

const repoFilesParams = await Promise.all(
	initRepoFile.map(async path => {
		const k = Object.keys(templateModels).find(
			k =>
				/\/([^\/]*)\.ts$/.exec(k)?.[1]?.replace('_', '/')?.toLocaleLowerCase() ===
				path.toLocaleLowerCase()
		)

		const content = await templateModels[k as string]().then((res: any) => Base64.enc(res.default))

		return {
			path,
			content,
			owner: userStore.loginName,
			repo: 'my-bookmarks',
			message: 'iBookmark: init private repo'
		}
	})
)

export const getRequestList = (): RequestObject[] => [
	{
		name: '仓库',
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
		name: item.path,
		request: useApiCreateBookmarkFile,
		params: item,
		result: []
	}))
]

// 队列，依次先进先出执行，前者未完成后者不会执行
export const requestQueue = async (
	callback: (isDone: boolean) => void,
	requests: RequestObject[],
	results: Ref<Result[]>
) => {
	if (!requests || !results || !results.value) return callback(false)
	if (isEmpty(requests)) {
		return callback(true)
	}
	const curRequest = requests.shift() as RequestObject
	results.value.push({
		name: curRequest.name,
		state: 0
	})
	const curResult = results.value.find(({ name }) => name === curRequest.name) as Result
	try {
		const { code, statusCode, statusMessage, message }: any = await curRequest.request(
			curRequest.params
		)
		if (code !== 200) throw new Error(message || statusMessage || statusCode)
		curResult.state = 1
	} catch (error) {
		curResult.state = -1
	} finally {
		// 如果是必须请求，那么失败则不会继续后面执行
		if (curRequest.required && curResult.state === -1) return callback(false)
		requestQueue(callback, requests, results)
	}
}
