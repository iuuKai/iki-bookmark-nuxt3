import { defineStore } from 'pinia'
import { LOGIN_NAME, HASREPO_NAME } from '@/permissions'

interface Menu {
	name: string
	path: string
	icon: string
	permissions?: string[]
}

interface MenState {
	menu: Menu[]
}

export const useMenuStore = defineStore({
	id: 'menu',
	state: (): MenState => ({
		menu: [
			{
				name: '首页',
				path: '/',
				icon: 'charm:home'
			},
			{
				name: '书签',
				path: '/bookmarks',
				icon: 'ic:outline-bookmarks',
				permissions: [LOGIN_NAME, HASREPO_NAME]
			},
			{
				name: '统计',
				path: '/statistic',
				icon: 'solar:graph-linear',
				permissions: [LOGIN_NAME, HASREPO_NAME]
			},
			{
				name: '发现好玩',
				path: '/funny',
				icon: 'game-icons:magic-portal'
			},
			{
				name: '反馈',
				path: '/issues',
				icon: 'uil:comment-edit',
				permissions: [LOGIN_NAME]
			},
			{
				name: '计划',
				path: '/plans',
				icon: 'mdi:calendar-edit-outline',
				permissions: [LOGIN_NAME, HASREPO_NAME]
			}
			// {
			// 	name: '随机'
			// }
		]
	}),
	getters: {
		getMenus(): Menu[] {
			return this.menu
		}
	}
})
