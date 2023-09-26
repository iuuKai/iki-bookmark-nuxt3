/*
 * @Author: iuukai
 * @Date: 2023-09-03 09:17:41
 * @LastEditors: iuukai
 * @LastEditTime: 2023-09-24 08:01:43
 * @FilePath: \iki-bookmark-nuxt3\assets\init-create-template\CONFIG.IBOOKMARK.json.ts
 * @Description:
 * @QQ/微信: 790331286
 */
import { useAuthorStore } from '@/store/modules/author'

const authorStore = useAuthorStore()

const CONFIG = {
	name: 'iBookmark',
	version: authorStore.VERSION,
	author: authorStore.OWNER,
	language: 'zh-CN',
	theme: 'light'
}

export default CONFIG
