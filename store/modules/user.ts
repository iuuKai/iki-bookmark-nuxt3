/*
 * @Author: iuukai
 * @Date: 2023-08-26 09:32:42
 * @LastEditors: iuukai
 * @LastEditTime: 2023-09-26 19:53:29
 * @FilePath: \iki-bookmark-nuxt3\store\modules\user.ts
 * @Description:
 * @QQ/微信: 790331286
 */
import { defineStore } from 'pinia'
import { useStorage } from '@vueuse/core'
import { useRepoStore } from './repo'
import { useCommentStore } from './comment'

interface UserState {
	type: string
	token: string
	oauthType: string | undefined
	userInfo: any
}
const TYPE_KEY = '_bm_type'
const OAUTH_TYPE_KEY = '_bm_oauthType'
const ACCESS_TOKEN_KEY = '_bm_token'

const type = useStorage(TYPE_KEY, '')
const oauthType = useStorage(OAUTH_TYPE_KEY, '')
const token = useStorage(ACCESS_TOKEN_KEY, '')

export const useUserStore = defineStore({
	id: 'user',
	state: (): UserState => {
		return {
			type: '',
			oauthType: '',
			token: '',
			userInfo: {}
		}
	},
	getters: {
		avatar(): string {
			return this.userInfo?.avatar_url ?? ''
		},
		isLogin(): boolean {
			return Boolean(this.token && this.userInfo?.login)
		},
		loginName(): string {
			return this.userInfo?.login ?? ''
		}
	},
	actions: {
		initStorageState() {
			this.token = token.value
			this.type = type.value || 'github'
			this.oauthType = oauthType.value
		},
		setToken(_token: string) {
			this.token = _token
			token.value = _token
		},
		setType(_type: string) {
			this.type = _type
			type.value = _type
		},
		setOauthType(_oauthType: string | undefined) {
			this.oauthType = _oauthType
			oauthType.value = _oauthType
		},
		setUserInfo(_userInfo: object) {
			this.userInfo = _userInfo
			// 有数据则清空 oauth_type
			this.setOauthType(undefined)
		},
		async apiGetUserInfo({ type, token }: { type?: string; token?: string }) {
			if (process.server) return
			try {
				const params = { type: type || this.type, token: token || this.token }
				const { statusCode, statusMessage, data }: any = await useApiGetUserInfo(params)
				if (statusCode) throw new Error(statusMessage)
				this.setUserInfo(data)
			} catch (error) {
				return Promise.reject(error)
			}
		},
		logout() {
			this.setToken('')
			this.setUserInfo({})
			useRepoStore().clear()
			useCommentStore().clear()
		}
	}
})
