/*
 * @Author: iuukai
 * @Date: 2023-08-26 09:31:17
 * @LastEditors: iuukai
 * @LastEditTime: 2023-09-10 00:24:30
 * @FilePath: \iki-bookmark-nuxt3\store\modules\author.ts
 * @Description:
 * @QQ/微信: 790331286
 */
import { defineStore } from 'pinia'
import { name as repoName, version, author } from '../../package.json'

interface AuthorState {
	repoName: string
	version: string
	author: Author
}

interface Author {
	email: string
	name: string
	github: string
	gitee: string
}

export const useAuthorStore = defineStore({
	id: 'author',
	state: (): AuthorState => ({
		repoName,
		version,
		author
	}),
	getters: {
		VERSION(): string {
			return version
		},
		AUTHOR(): Author {
			return author
		}
	},
	actions: {}
})
