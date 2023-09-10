<!--
 * @Author: iuukai
 * @Date: 2023-08-06 11:46:34
 * @LastEditors: iuukai
 * @LastEditTime: 2023-09-10 11:37:44
 * @FilePath: \iki-bookmark-nuxt3\app.vue
 * @Description: 
 * @QQ/微信: 790331286
-->
<template>
	<NuxtLayout>
		<NuxtPage />
	</NuxtLayout>
</template>

<script setup lang="ts">
import { useUserStore } from '@/store/modules/user'
import { useRepoStore } from '@/store/modules/repo'

const userStore = useUserStore()
const repoStore = useRepoStore()
const isLogin = computed(() => userStore.isLogin)

const getBookmarkRepo = async () => {
	try {
		const { code, msg, data }: any = await useApiGetBookmarkRepo({
			owner: repoStore.owner,
			repo: repoStore.repo
		})
		if (code !== 200 && code !== 404) throw new Error(msg)
		if (code == 404) console.log('请创建名为 "my-bookmarks" 的仓库')

		repoStore.setRepoInfo(data)
	} catch (error: any) {
		console.log(error)
	}
}

const getBookmarkRepoConfig = async () => {
	try {
		const params = {
			owner: repoStore.owner,
			repo: repoStore.repo,
			path: 'config.ibookmark.json'
		}
		const { code, msg, data }: any = await useApiGetBookmarkContents(params)
		if (code !== 200) throw new Error(msg)
		repoStore.setRepoConfig(data)
	} catch (error: any) {
		console.log(error)
	}
}

watch(
	isLogin,
	async v => {
		if (!v) return
		Promise.all([getBookmarkRepo(), getBookmarkRepoConfig()])
	},
	{ immediate: true }
)
</script>

<style scoped lang="less"></style>
