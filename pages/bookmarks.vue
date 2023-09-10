<!--
 * @Author: iuukai
 * @Date: 2023-08-14 06:20:11
 * @LastEditors: iuukai
 * @LastEditTime: 2023-09-10 00:28:50
 * @FilePath: \iki-bookmark-nuxt3\pages\bookmarks.vue
 * @Description: 
 * @QQ/微信: 790331286
-->
<template>
	<div>
		<div>
			<el-button type="primary">添加</el-button>
			<el-button type="danger">批量删除</el-button>
			<el-button type="primary">查看分类</el-button>
			<el-button type="primary">查看标签</el-button>
		</div>
		<div class="w-full">
			<div>
				<el-tag class="mr-2" v-for="n in 20">123</el-tag>
			</div>
		</div>

		<div>{{ tag }}</div>
		<div>{{ data }}</div>
		<div>{{ category }}</div>
		<div>{{ errResponsePath }}</div>
	</div>
</template>

<script setup lang="ts">
import { useRepoStore } from '@/store/modules/repo'

definePageMeta({ middleware: ['auth'] })

const repoStore = useRepoStore()

const repoDir = 'website'
const repoReg = new RegExp(`^${repoDir}/.*\.json`)
const repoFiles = repoStore.initRepoFile.filter(path => repoReg.test(path))

const tag = ref([])
const data = ref([])
const category = ref([])
const errResponsePath = ref<string[]>([])

initData()
async function initData() {
	if (process.server) return
	const requestList = repoFiles.map(async path => {
		try {
			const params = {
				owner: repoStore.owner,
				repo: repoStore.repo,
				path
			}
			const { code, message, data }: any = await useApiGetBookmarkContents(params)
			if (code !== 200) throw new Error(message)
			return [null, data]
		} catch (error: any) {
			console.error(error.message ?? error)
			return [path, null]
		}
	})

	const all = await Promise.all(requestList)
	all.forEach(([errPath, succData]) => {
		try {
			if (errPath) return errResponsePath.value.push(errPath)
			const curPath = errPath ?? succData.path
			const match = /\/([^]*)\./.exec(curPath)?.[1] || ''
			const list = Base64.dec(succData.content)

			switch (match) {
				case 'tag':
					tag.value = errPath ?? list
					break
				case 'data':
					data.value = errPath ?? list
					break
				case 'category':
					category.value = errPath ?? list
					break
			}
		} catch (error) {
			console.log(error)
		}
	})
}
</script>

<style scoped lang="less"></style>
