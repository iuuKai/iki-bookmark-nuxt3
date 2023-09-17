<!--
 * @Author: iuukai
 * @Date: 2023-09-11 09:58:49
 * @LastEditors: iuukai
 * @LastEditTime: 2023-09-17 02:55:08
 * @FilePath: \iki-bookmark-nuxt3\components\common\dialog\update-website.vue
 * @Description: 
 * @QQ/微信: 790331286
-->
<template>
	<div class="bm-update-website_wrapper">
		<el-form ref="formRef" :model="form" :rules="rules">
			<el-tabs v-model="activeName" type="border-card">
				<el-tab-pane label="网址信息" name="1">
					<el-form-item ref="formItemRef" prop="url">
						<el-input
							v-model="form.url"
							size="large"
							placeholder="网站地址，如：https://www.baidu.com"
							clearable
						>
							<template #append>
								<el-button
									:loading="isGetWebContentLoading"
									@click="handleGetWebContent(formItemRef, form.url)"
								>
									抓取标题
								</el-button>
							</template>
						</el-input>
					</el-form-item>
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
									<img v-if="form.icon" :src="form.icon" alt="" />
									<Icon v-else name="fluent:camera-24-filled" size="1.5rem" />
								</div>
							</template>
						</el-popover>
						<el-form-item class="flex-1" prop="title">
							<el-input
								v-model="form.title"
								size="large"
								placeholder="网站名称"
								:maxlength="MaxLengthTitle"
								show-word-limit
								clearable
							/>
						</el-form-item>
					</div>
					<el-form-item prop="categoryId">
						<el-select
							v-model="form.categoryId"
							class="w-full"
							size="large"
							placeholder="网站分类"
							filterable
							allow-create
							default-first-option
						>
							<el-option
								v-for="item in list"
								:key="item.value"
								:label="item.label"
								:value="item.value"
							/>
						</el-select>
					</el-form-item>
				</el-tab-pane>
				<el-tab-pane label="网址备注" name="2">
					<el-alert
						class="!mb-4"
						title="保存后，鼠标触摸网址即可展示备注"
						type="info"
						show-icon
						:closable="false"
					/>
					<el-input
						v-model="form.description"
						:rows="5"
						type="textarea"
						placeholder="在这里你可以给网址一个备注说明"
						:maxlength="MaxLengthDescription"
						show-word-limit
						resize="none"
					/>
				</el-tab-pane>
			</el-tabs>
		</el-form>
		<div class="mt-4 text-right">
			<el-button :disabled="isBusyness" @click="emits('cancel')">取消</el-button>
			<el-button :loading="isBusyness" type="primary" @click="handleConfirm(formRef)">
				保存
			</el-button>
		</div>
	</div>
</template>

<script setup lang="ts">
import { transformAbsolutePath } from '@/utils/custom-function'
import { generateId } from '@/utils/custom-function'
import type { FormInstance, FormItemInstance } from 'element-plus'

const emits = defineEmits(['update:formData', 'cancel', 'confirm'])
const props = defineProps({
	isSubmitLoading: {
		typee: Boolean,
		default: false
	},
	formData: {
		type: Object,
		default: () => ({})
	},
	categoryList: {
		type: Array as () => { value: string; label: string }[],
		default: () => []
	}
})

const MaxLengthTitle = 100
const MaxLengthDescription = 200
const formRef = ref()
const formItemRef = ref()
const form = computed<any>({
	get: () => props.formData,
	set: (v: any) => emits('update:formData', v)
})
const rules = ref({
	url: [
		{ required: true, message: '请输入网站链接URL', trigger: 'blur' },
		{
			validator: (rule: any, value: any, callback: any) => {
				if (/^https?:\/\//.test(value)) {
					try {
						new URL(value)
						callback()
					} catch (error) {
						callback(new Error('请输入合法的链接'))
					}
				} else {
					callback(new Error('请输入http或https开头的链接'))
				}
			},
			trigger: 'change'
		}
	],
	title: [{ required: true, message: '请输入网站名称', trigger: 'blur' }]
})

const activeName = ref('1')
const isPopoverShow = ref(false)
const isGetWebContentLoading = ref(false)
const isBusyness = computed(() => props.isSubmitLoading || isGetWebContentLoading.value)
const list = computed(() => {
	const isEmptyCategory = isEmpty(props.categoryList)
	const defaultCategory = '默认'
	const arr = isEmptyCategory
		? [
				{
					label: defaultCategory,
					value: defaultCategory
				}
		  ]
		: props.categoryList
	if (isEmptyCategory) form.value.categoryId = defaultCategory
	return arr
})

const validateWebsiteUrl = (formItemEl: FormItemInstance | undefined) => {
	if (!formItemEl) return
	return new Promise((resolve, reject) => {
		formItemEl.validate('change', (valid, fields) => {
			if (!valid) return false
			resolve(valid)
		})
	})
}

const handleGetWebContent = async (formItemEl: FormItemInstance | undefined, url: string) => {
	if (!url) return ElMessage.error('请输入网站地址URL')
	try {
		await validateWebsiteUrl(formItemEl)
		isGetWebContentLoading.value = true
		const { code, msg, data }: any = await useApiGetWebContent(url)
		if (code !== 200) throw new Error(msg)
		form.value.icon = transformAbsolutePath(url, data.icon)
		form.value.title = data.title.slice(0, MaxLengthTitle)
		form.value.description = data.description.slice(0, MaxLengthDescription)
	} catch (error) {
		ElMessage.error('抓取失败')
	} finally {
		isGetWebContentLoading.value = false
	}
}

const handleConfirm = async (formEl: FormInstance | undefined) => {
	if (!formEl) return
	await formEl.validate((valid, fields) => {
		if (!valid) return false
		emits('confirm')
	})
}

const clearForm = () => {
	form.value = {}
	activeName.value = '1'
	isGetWebContentLoading.value = false
	if (formRef.value) {
		formRef.value.resetFields()
	}
}

defineExpose({
	clearForm
})
</script>

<style scoped lang="less">
.bm-update-website_wrapper {
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
