<!--
 * @Author: iuukai
 * @Date: 2023-08-06 11:46:34
 * @LastEditors: iuukai
 * @LastEditTime: 2023-09-01 23:55:55
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
import { useBookmarkStore } from '@/store/modules/bookmark'

const userStore = useUserStore()
const bookmarkStore = useBookmarkStore()
const userInfo = computed(() => userStore.userInfo)

const getBookmarkRepo = async (login: string) => {
	try {
		const { code, msg, data }: any = await useApiGetBookmarkRepo({
			owner: login,
			repo: 'my-bookmarks'
		})
		if (code !== 200 && code !== 404) throw new Error(msg)
		if (code == 404) console.log('请创建名为 "my-bookmarks" 的仓库')
		bookmarkStore.setBookmarkRepo(data)
	} catch (error) {}
}

watch(
	userInfo,
	async v => {
		if (isEmpty(v)) return
		await getBookmarkRepo(v.login)
	},
	{ immediate: true }
)
</script>

<style scoped lang="less"></style>
