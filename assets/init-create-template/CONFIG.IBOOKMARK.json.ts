/*
 * @Author: iuukai
 * @Date: 2023-09-03 09:17:41
 * @LastEditors: iuukai
 * @LastEditTime: 2023-09-27 00:43:33
 * @FilePath: \iki-bookmark-nuxt3\assets\init-create-template\CONFIG.IBOOKMARK.json.ts
 * @Description:
 * @QQ/微信: 790331286
 */
const { version, author } = useAppConfig()

const CONFIG = {
	name: 'iBookmark',
	version: version,
	author: author.owner,
	language: 'zh-CN',
	theme: 'light'
}

export default CONFIG
