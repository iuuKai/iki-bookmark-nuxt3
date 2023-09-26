<!--
 * @Author: iuukai
 * @Date: 2023-08-06 11:46:34
 * @LastEditors: iuukai
 * @LastEditTime: 2023-09-24 13:46:43
 * @FilePath: \iki-bookmark-nuxt3\app.vue
 * @Description: 
 * @QQ/微信: 790331286
-->
<template>
	<ElConfigProvider :locale="zhCn">
		<NuxtLoadingIndicator
			:throttle="0"
			:color="'radial-gradient(300px at 27.7% -15.7%, rgb(18, 246, 246) 0%, rgb(7, 103, 233) 73.9%)'"
		/>
		<NuxtLayout>
			<NuxtPage />
		</NuxtLayout>
	</ElConfigProvider>
</template>

<script setup lang="ts">
import zhCn from 'element-plus/es/locale/lang/zh-cn'
</script>

<style scoped lang="less"></style>
