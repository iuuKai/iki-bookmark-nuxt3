<!--
 * @Author: iuukai
 * @Date: 2023-08-28 08:38:08
 * @LastEditors: iuukai
 * @LastEditTime: 2023-09-26 22:16:32
 * @FilePath: \iki-bookmark-nuxt3\pages\oauth.vue
 * @Description: 
 * @QQ/微信: 790331286
-->
<template>
	<div class="bm-oauth">
		<BasicEchartLogo :title="commentStore.REPO" :font-size="100" :duration="5000" />
	</div>
</template>

<script setup lang="ts">
import { useStorage } from '@vueuse/core'
import { useUserStore } from '@/store/modules/user'
import { useCommentStore } from '@/store/modules/comment'

definePageMeta({
	layout: false,
	middleware: ['c-access-forbidden']
})

const userStore = useUserStore()
const commentStore = useCommentStore()
const code = computed(() => (process.client && /code=([^&]*)/.exec(location.search)?.[1]) ?? '')
const oauthError = computed(
	() => (process.client && /error=([^&]*)/.exec(location.search)?.[1]) ?? ''
)
const oauth = useStorage('oauth_data', null, undefined, {
	serializer: {
		read: v => (v ? JSON.parse(v) : null),
		write: v => JSON.stringify(v)
	}
})

watch(
	[code, oauthError],
	async ([c, errMsg]: any) => {
		if (errMsg) {
			oauth.value = {
				code: 500,
				message: errMsg,
				data: null,
				type: userStore.oauthType,
				timestamp: Date.now()
			}
		} else if (c) {
			try {
				const res: any = await useApiGetOauthToken({
					redirect_uri: location.href.replace(location.search, ''),
					code: c
				})
				oauth.value = {
					...res,
					type: userStore.oauthType,
					timestamp: Date.now()
				}
			} catch (error: any) {
				oauth.value = {
					code: 500,
					message: error?.message ?? error,
					data: null,
					type: userStore.oauthType,
					timestamp: Date.now()
				}
			}
		}
		if (process.client) window.close()
	},
	{ immediate: true }
)
</script>

<style scoped lang="less">
.bm-oauth {
	@apply w-screen h-screen;
}
</style>
