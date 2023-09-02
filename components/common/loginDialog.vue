<!--
 * @Author: iuukai
 * @Date: 2023-08-27 00:24:23
 * @LastEditors: iuukai
 * @LastEditTime: 2023-09-02 02:06:51
 * @FilePath: \iki-bookmark-nuxt3\components\common\loginDialog.vue
 * @Description: 
 * @QQ/微信: 790331286
-->
<template>
	<el-dialog
		v-model="dialogVisible"
		class="bm-login_dialog"
		title="账号登录"
		width="400px"
		:close-on-click-modal="false"
		append-to-body
	>
		<el-divider content-position="left">Account Token</el-divider>
		<el-input v-model="inputToken" placeholder="请输入令牌..." class="input-with-select">
			<template #prepend>
				<el-select v-model="selectType" placeholder="Select" class="bm-type_select">
					<el-option label="GitHub" value="github" />
					<el-option label="Gitee" value="gitee" />
				</el-select>
			</template>
		</el-input>
		<el-button class="my-4 w-full" tag="div" type="primary" @click="handleSignIn">登录</el-button>
		<el-divider content-position="center">授权登录</el-divider>
		<div class="bm-icon_bar">
			<el-icon
				v-for="icon in iconBar"
				:key="icon.type"
				:id="`is-${icon.type}`"
				size="2.5rem"
				@click="handleIconClick(icon.type)"
			>
				<component :is="icon.component" />
			</el-icon>
		</div>
	</el-dialog>
</template>

<script setup lang="ts">
import { useStorage } from '@vueuse/core'
import { useUserStore } from '@/store/modules/user'

const OAUTH_KEY = 'oauth_data'
const oauth = useStorage(OAUTH_KEY, null, undefined, {
	serializer: {
		read: v => (v ? JSON.parse(v) : null),
		write: v => JSON.stringify(v)
	}
})
const userStore = useUserStore()

const selectType = ref('github')
const inputToken = ref('')

const dialogVisible = computed({
	get: () => userStore.isLoginDialogShow,
	set: (val: boolean) => userStore.setLoginDialogShow(val)
})
const token = computed({
	get: () => userStore.token,
	set: (val: string) => userStore.setToken(val)
})
// const type = computed({
// 	get: () => userStore.type,
// 	set: (val: string) => userStore.setType(val)
// })

const gitIconModules = import.meta.glob('../icon/Git*.vue')
const iconBar = await Promise.all(
	Object.keys(gitIconModules).map(async k => {
		const type = useToLower(k.replace(/\.\.\/icon\/(.*)\.vue/gi, '$1'))
		const component = await gitIconModules[k]().then((res: any) => res.default)
		return {
			type,
			component
		}
	})
)

const login = async (params: { type: string; token: string }) => {
	try {
		const { code, msg, data }: any = await useApiGetUserInfo(params)
		console.log(code, msg)
		if (code !== 200) throw new Error(msg)
		userStore.setUserInfo(data)
		// const res: any = await useApiGetUserBookmarkRepo({
		// 	owner: userInfo.login,
		// 	repo: 'my-bookmarks'
		// })
		// console.log(res)
	} catch (error) {
		return Promise.reject(error)
	}
}

const handleSignIn = async () => {
	try {
		userStore.setType(selectType.value)
		await login({ type: selectType.value, token: inputToken.value })
		token.value = inputToken.value
		dialogVisible.value = false
		ElMessage.success('登录成功')
	} catch (error) {
		console.error(error)
		userStore.setToken('')
		ElMessage.error('登录失败')
	}
	clearCache()
}
const handleIconClick = async (type: string) => {
	try {
		const redirect_uri = location.origin + '/oauth'
		const { data }: any = await useApiGetAuthorizeUrl({
			type,
			redirect_uri
		})
		new URL(data.url)
		// 记录授权平台
		userStore.setOauthType(type)
		window.open(data.url, '_blank', 'width=500,height=500')
	} catch (error) {
		ElMessage.error('前往授权页面失败...')
	}
}

const clearCache = () => {
	userStore.setType(userStore.oauthType as string)
	// 清空授权平台
	userStore.setOauthType(undefined)
	oauth.value = null
}

watch(oauth, async v => {
	if (!v) return
	const { code, msg, data } = v
	if (code === 200) {
		token.value = data.access_token
		// 获取用户信息
		await login({ type: userStore.oauthType as string, token: data.access_token })
		dialogVisible.value = false
		ElMessage.success('登录成功')
	} else {
		console.error(msg)
		ElMessage.error('授权失败')
	}
	clearCache()
})
</script>

<style lang="less">
.bm-login_dialog {
	@apply rounded-md;

	.el-dialog__body {
		@apply pt-1 pb-5;

		.bm-type_select {
			@apply w-24;
		}

		.bm-icon_bar {
			@apply flex justify-center items-center gap-4;

			.el-icon {
				@apply cursor-pointer duration-200;

				&:hover {
					&#is-github {
						color: @github-color;
					}

					&#is-gitee {
						color: @gitee-color;
					}
				}
			}
		}
	}
}
</style>
