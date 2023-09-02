/*
 * @Author: iuukai
 * @Date: 2023-08-26 09:32:42
 * @LastEditors: iuukai
 * @LastEditTime: 2023-09-01 23:57:38
 * @FilePath: \iki-bookmark-nuxt3\store\modules\user.ts
 * @Description:
 * @QQ/微信: 790331286
 */
import { defineStore } from 'pinia'
import { useStorage } from '@vueuse/core'

interface UserState {
	isLoginDialogShow: boolean
	type: string
	token: string
	oauthType: string | undefined
	userInfo: any
}

const TYPE_KEY = '_bm_type'
const OAUTH_TYPE_KEY = '_bm_oauthType'
const ACCESS_TOKEN_KEY = '_bm_token'
const USER_IFNO_KEY = '_bm_userInfo'

const type = useStorage(TYPE_KEY, '')
const oauthType = useStorage(OAUTH_TYPE_KEY, '')
const token = useStorage(ACCESS_TOKEN_KEY, '')
const userInfo = useStorage(USER_IFNO_KEY, {}, undefined, {
	serializer: {
		read: v => (v ? JSON.parse(v) : null),
		write: v => JSON.stringify(v)
	}
})

export const useUserStore = defineStore({
	id: 'user',
	state: (): UserState => {
		return {
			isLoginDialogShow: false,
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
		}
	},
	actions: {
		setLoginDialogShow(_show: boolean) {
			this.isLoginDialogShow = _show
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
			userInfo.value = _userInfo
		},
		initStorageState() {
			this.token = token.value
			this.type = type.value || 'github'
			this.oauthType = oauthType.value
			this.userInfo = userInfo.value
		}
	}
})
