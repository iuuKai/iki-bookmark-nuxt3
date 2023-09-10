<!--
 * @Author: iuukai
 * @Date: 2023-08-28 08:38:08
 * @LastEditors: iuukai
 * @LastEditTime: 2023-09-04 08:52:24
 * @FilePath: \iki-bookmark-nuxt3\pages\oauth.vue
 * @Description: 
 * @QQ/微信: 790331286
-->
<template>
	<div>demo</div>
</template>

<script setup lang="ts">
import { useStorage } from '@vueuse/core'

definePageMeta({
	layout: false
})

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
	async ([c, errMsg]) => {
		if (errMsg) {
			oauth.value = {
				code: 500,
				msg: errMsg,
				data: null,
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
					timestamp: Date.now()
				}
			} catch (error: any) {
				oauth.value = {
					code: 500,
					msg: error?.message ?? error,
					data: null,
					timestamp: Date.now()
				}
			}
		}
		if (process.client) window.close()
	},
	{ immediate: true }
)
</script>

<style scoped lang="less"></style>
