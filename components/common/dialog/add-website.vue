<!--
 * @Author: iuukai
 * @Date: 2023-09-11 09:58:49
 * @LastEditors: iuukai
 * @LastEditTime: 2023-09-12 20:50:45
 * @FilePath: \iki-bookmark-nuxt3\components\common\dialog\add-website.vue
 * @Description: 
 * @QQ/微信: 790331286
-->
<template>
	<div class="bm-addwebsite_wrapper">
		<el-form ref="formRef" :model="form">
			<el-tabs type="border-card">
				<el-tab-pane label="网址信息">
					<el-form-item>
						<el-input
							v-model="websiteInfo.url"
							size="large"
							placeholder="网站地址，如：https://www.baidu.com"
						>
							<template #append>
								<el-button
									:loading="isGetWebContentLoading"
									@click="handleGetWebContent(websiteInfo.url)"
								>
									抓取标题
								</el-button>
							</template>
						</el-input>
					</el-form-item>
					<el-form-item>
						<div class="w-full flex gap-3">
							<el-popover
								placement="bottom"
								:width="200"
								trigger="click"
								@show="isPopoverShow = true"
								@hide="isPopoverShow = false"
							>
								123123
								<template #reference>
									<div :class="['bm-upload-icon', { 'is-active': isPopoverShow }]">
										<Icon name="fluent:camera-24-filled" size="1.5rem" />
									</div>
								</template>
							</el-popover>
							<el-input
								v-model="websiteInfo.title"
								size="large"
								placeholder="网站名称"
								maxlength="100"
								show-word-limit
							/>
						</div>
					</el-form-item>
					<el-form-item>
						<el-select
							v-model="websiteInfo.category"
							class="w-full"
							size="large"
							placeholder="网站分类"
							filterable
							allow-create
							default-first-option
						>
							<el-option
								v-for="item in categoryList"
								:key="item.value"
								:label="item.label"
								:value="item.value"
							/>
						</el-select>
					</el-form-item>
				</el-tab-pane>
				<el-tab-pane label="网址备注">
					<el-alert
						class="!mb-4"
						title="保存后，鼠标触摸网址即可展示备注"
						type="info"
						show-icon
						:closable="false"
					/>
					<el-input
						v-model="websiteInfo.description"
						:rows="5"
						type="textarea"
						placeholder="在这里你可以给网址一个备注说明"
						maxlength="100"
						show-word-limit
						resize="none"
					/>
				</el-tab-pane>
			</el-tabs>
		</el-form>
	</div>
</template>

<script setup lang="ts">
const props = defineProps({
	categoryList: {
		type: Array as () => { value: string; label: string }[],
		default: () => []
	}
})

const initWebsite = () => ({
	url: '',
	title: '',
	icon: '',
	category: props.categoryList[0],
	description: ''
})

const form = ref({})

const isPopoverShow = ref(false)
const isGetWebContentLoading = ref(false)
const websiteInfo = ref(initWebsite())
// cryptoRandomString({length: 16})

const handleGetWebContent = async (url: string) => {
	if (!url) return ElMessage.error('请输入网站地址URL')
	isGetWebContentLoading.value = true
	try {
		const { code, msg, data }: any = await useApiGetWebContent(url)
		if (code !== 200) throw new Error(msg)
		websiteInfo.value.title = data.title
		/**
		 * 还要处理相对、绝对路径
		 */
		websiteInfo.value.icon = data.icon
		websiteInfo.value.description = data.description
	} catch (error) {
		console.error(error)
	}
	isGetWebContentLoading.value = false
}

const clearForm = () => {
	websiteInfo.value = initWebsite()
}

defineExpose({
	clearForm
})
</script>

<style scoped lang="less">
.bm-addwebsite_wrapper {
	.bm-upload-icon {
		@apply flex-none flex justify-center items-center w-10 h-10 border rounded cursor-pointer;
		@apply border-gray-300 text-gray-400 duration-300;

		&:hover,
		&.is-active {
			@apply text-blue-400 border-blue-400;
		}
	}
}
</style>
