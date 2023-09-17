<!--
 * @Author: iuukai
 * @Date: 2023-08-27 00:24:23
 * @LastEditors: iuukai
 * @LastEditTime: 2023-09-13 13:09:36
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
		<el-button
			:loading="isLoading"
			class="my-4 w-full"
			tag="div"
			type="primary"
			@click="handleSignIn"
		>
			登录
		</el-button>
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
import { useRepoStore } from '@/store/modules/repo'

const OAUTH_KEY = 'oauth_data'
const oauth = useStorage(OAUTH_KEY, null, undefined, {
	serializer: {
		read: v => (v ? JSON.parse(v) : null),
		write: v => JSON.stringify(v)
	}
})
const userStore = useUserStore()
const repoStore = useRepoStore()

const selectType = ref('github')
const inputToken = ref('')
const isLoading = ref(false)
const oauthWindow = ref()

const dialogVisible = computed({
	get: () => userStore.isLoginDialogShow,
	set: (val: boolean) => userStore.setLoginDialogShow(val)
})
const token = computed({
	get: () => userStore.token,
	set: (val: string) => userStore.setToken(val)
})

const gitIconModules = import.meta.glob('../icon/Git*.vue', {
	eager: true,
	import: 'default'
})
const iconBar = Object.keys(gitIconModules).map(k => {
	const type = useToLower(k.replace(/\.\.\/icon\/(.*)\.vue/gi, '$1'))
	return {
		type,
		component: gitIconModules[k]
	}
})

const checkBusyness = () => {
	if (oauthWindow.value && !oauthWindow.value.closed) return '正在授权，请稍后再试'
	if (isLoading.value) return '正在登录，请稍后再试'
}

const login = async (params: { type: string; token: string }) => {
	try {
		isLoading.value = true
		const { code, message, data }: any = await useApiGetUserInfo(params)
		if (code !== 200) throw new Error(message)
		await userStore.setUserInfo(data)
		await getRepo()

		dialogVisible.value = false
	} catch (error) {
		return Promise.reject(error)
	} finally {
		isLoading.value = false
	}
}

const getRepo = async () => {
	try {
		// 获取仓库信息
		await repoStore.apiGetRepoInfo()
		// 获取配置信息
		await repoStore.apiGetConfigData()
	} catch (error) {
		return Promise.reject(error)
	}
}

const handleSignIn = async () => {
	if (checkBusyness()) return ElMessage.error(checkBusyness())
	if (!inputToken.value) return ElMessage.error('请输入token')
	try {
		// isLoading.value = true
		userStore.setType(selectType.value)
		await login({ type: selectType.value, token: inputToken.value })
		token.value = inputToken.value
		ElMessage.success('登录成功')
	} catch (error) {
		console.error(error)
		userStore.setToken('')
		ElMessage.error('登录失败')
	} finally {
		// isLoading.value = false
		clearCache()
	}
}
const handleIconClick = async (type: string) => {
	if (checkBusyness()) return ElMessage.error(checkBusyness())
	try {
		oauthWindow.value = true
		const redirect_uri = location.origin + '/oauth'
		const { data }: any = await useApiGetAuthorizeUrl({
			type,
			redirect_uri
		})
		new URL(data.url)
		// 记录授权平台
		userStore.setOauthType(type)
		oauthWindow.value = window.open(data.url, '_blank', 'width=500,height=500') as Window
	} catch (error) {
		oauthWindow.value = null
		ElMessage.error('前往授权页面失败...')
	}
}

const clearCache = () => {
	// 清空授权平台
	userStore.setOauthType(undefined)
	oauth.value = null
	oauthWindow.value = null
}

watch(oauth, async (v: any) => {
	if (!v) return
	try {
		const { code, message, data, type } = v
		if (code === 200) {
			token.value = data.access_token
			userStore.setType(type)
			await login({ type, token: data.access_token })
			ElMessage.success('登录成功')
		} else {
			console.error(message)
			ElMessage.error('授权失败')
		}
	} finally {
		clearCache()
	}
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
