/*
 * @Author: iuukai
 * @Date: 2023-09-23 01:52:07
 * @LastEditors: iuukai
 * @LastEditTime: 2023-09-26 13:03:34
 * @FilePath: \iki-bookmark-nuxt3\app.config.ts
 * @Description:
 * @QQ/微信: 790331286
 */
export default defineAppConfig({
	baseURL: 'https://ibookmark.onrender.com/',
	proxyURL: 'https://cors-anywhere.azm.workers.dev/',
	author: {
		owner: 'iuuKai',
		repo: 'iBookmark',
		email: '790331286@163.com',
		github: 'https://github.com/iuuKai',
		gitee: 'https://gitee.com/iuuKai'
	},
	issue: {
		labels: ['iBookmark'],
		body: 'iBookmark 页面评论功能',
		title: 'iBookmark - Comments: ${n}'
	},
	db_repo: 'my-bookmarks',
	github: {
		dev: {
			client_id: '87d5736d72278408718d',
			client_secret: 'd4bfbd199b5e660444d2465d4459cfff1983232a'
		},
		build: {
			client_id: 'c39129536a5e006fe5e0',
			client_secret: '885832ef89d2aeb3930f85ffbb5d4036858589cf'
		}
	},
	gitee: {
		dev: {
			client_id: '6d0f3a4c2012fb59bfa6f508fe0af9f0d004b30ed3f50380a1fc7acdfa249955',
			client_secret: '7d0245f12f40597b398c8a6bea7a4423f266ccec56c7912ba8e376f9bb5c774a'
		},
		build: {
			client_id: 'cf416aa37bdb53140a0f2d71c89b9d7a6e9b1d5cceefa1ded76b4ffd5aabd3b5',
			client_secret: 'ed6d510f0b3952157184f5e67a614e61cfe0884bbf28bf56ff0611653220fcfa'
		}
	}
})
