<!--
 * @Author: iuukai
 * @Date: 2023-09-11 09:58:49
 * @LastEditors: iuukai
 * @LastEditTime: 2023-09-30 23:20:40
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
							width="auto"
							trigger="click"
							ref="popoverRef"
							@show="isPopoverShow = true"
							@hide="isPopoverShow = false"
						>
							<div>
								<el-button type="primary" :icon="UploadFilled">上传图标</el-button>
								<el-button @click="handleRemoteIcon(popoverRef)">远程图标</el-button>
							</div>
							<template #reference>
								<div :class="['bm-upload-icon', { 'is-active': isPopoverShow }]">
									<!-- <img v-if="form.icon" class="max-h-full" :src="form.icon" /> -->
									<BasicImage
										v-if="form.icon"
										loadingIconSize="0.8rem"
										class="w-full h-full"
										:src="form.icon"
										fit="contain"
									/>
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
							filterable
							allow-create
							:reserve-keyword="false"
							class="w-full"
							size="large"
							placeholder="网站分类"
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
		<el-dialog
			v-model="innerVisible"
			width="460px"
			top="20vh"
			title="远程图标"
			append-to-body
			:close-on-click-modal="false"
		>
			<div>
				<el-alert
					v-show="isInValid"
					class="!mb-4"
					title="该图标链接无法识别，请输入正确的图标链接地址！"
					type="error"
					show-icon
					:closable="false"
				/>
				<el-input
					v-model="remoteIcon"
					size="large"
					clearable
					placeholder="请输入远程图标链接地址"
				/>
			</div>
			<div class="mt-4 flex justify-center">
				<el-button @click="innerVisible = false">关闭</el-button>
				<el-button type="primary" @click="hanldeSaveRemoteIcon(remoteIcon)">保存远程图标</el-button>
			</div>
		</el-dialog>
		<div class="mt-4 text-right">
			<el-button :disabled="isBusyness" @click="emits('cancel')">取消</el-button>
			<el-button :loading="isBusyness" type="primary" @click="handleConfirm(formRef)">
				保存
			</el-button>
		</div>
	</div>
</template>

<script setup lang="ts">
import { UploadFilled } from '@element-plus/icons-vue'
import type { FormInstance, FormItemInstance, PopoverInstance } from 'element-plus'

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

const defaultCategory = '默认'
const activeName = ref('1')
const isPopoverShow = ref(false)
const isGetWebContentLoading = ref(false)
const isBusyness = computed(() => props.isSubmitLoading || isGetWebContentLoading.value)
const list = computed(() => {
	const isEmptyCategory = isEmpty(props.categoryList)
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

const popoverRef = ref()
const remoteIcon = ref('')
const isInValid = ref(false)
const innerVisible = ref(false)
watch(innerVisible, (v: boolean) => (isInValid.value = false))

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
		const { statusCode, statusMessage, data = {} }: any = await useApiGetWebContent({ url })
		if (statusCode) throw new Error(statusMessage)
		form.value.icon = data.icon
		form.value.title = data.title.slice(0, MaxLengthTitle) || data.url
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

const handleRemoteIcon = (popoverEl: PopoverInstance) => {
	if (!popoverEl) return
	innerVisible.value = true
	popoverEl.hide()
}

const hanldeSaveRemoteIcon = async (url: string) => {
	try {
		const iconURL = await checkImageUrlValid(url)
		form.value.icon = iconURL
		isInValid.value = false
		innerVisible.value = false
	} catch (error) {
		isInValid.value = true
		ElMessage.error('请输入正确的图片地址')
	}
}

let isProxy = false
const checkImageUrlValid = (url: string) => {
	return new Promise((resolve, reject) => {
		const img = new Image()
		img.src = url
		img.addEventListener('load', () => {
			isProxy = false
			resolve(img.src)
		})
		img.addEventListener('error', () => {
			if (isProxy) return reject()
			isProxy = true
			img.src = '/api/proxy/' + url
		})
	})
}

const clearForm = () => {
	if (formRef.value) {
		formRef.value.resetFields()
	}
	form.value = {}
	remoteIcon.value = ''
	activeName.value = '1'
	isGetWebContentLoading.value = false
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
