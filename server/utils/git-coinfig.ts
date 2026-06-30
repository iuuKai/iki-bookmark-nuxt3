/*
 * @Author: iuukai
 * @Date: 2023-09-22 21:06:38
 * @LastEditors: iuukai
 * @LastEditTime: 2023-09-26 13:22:34
 * @FilePath: \iki-bookmark-nuxt3\server\utils\git-coinfig.ts
 * @Description:
 * @QQ/微信: 790331286
 */
export type Type = 'github' | 'gitee'
type Mode = 'dev' | 'build'

export const useGitConfig = (_host: string, _type: Type) => {
	const isDev = /127.0.0.1|localhost/.test(_host)
	const mode: Mode = isDev ? 'dev' : 'build'
	const appConfig = useAppConfig() as any
	const { client_id, client_secret } = appConfig[_type][mode]
	return { client_id, client_secret }
}
