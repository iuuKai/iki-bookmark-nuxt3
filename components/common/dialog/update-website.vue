<template>
	<div class="bm-update-website_wrapper">
		<el-form ref="formRef" :model="form" :rules="rules">
			<el-tabs v-model="activeName" type="border-card">
				<el-tab-pane label="网址信息" name="1">
					<el-form-item ref="formItemRef" prop="url">
						<el-input
							v-model="form.url"
							size="large"
							placeholder="网站地址，例如：https://www.baidu.com"
							clearable
						>
							<template #append>
								<el-button
									:loading="isGetWebContentLoading"
									@click="handleGetWebContent(formItemRef, form.url)"
								>
									抓取信息
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
								:maxlength="maxLengthTitle"
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
						title="保存后将显示在书签卡片描述区域"
						type="info"
						show-icon
						:closable="false"
					/>
					<el-input
						v-model="form.description"
						:rows="5"
						type="textarea"
						placeholder="可在这里记录这个网址的用途、登录方式或注意事项"
						:maxlength="maxLengthDescription"
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
					title="该图标链接无法加载，请输入可访问的图片地址"
					type="error"
					show-icon
					:closable="false"
				/>
				<el-input
					v-model="remoteIcon"
					size="large"
					clearable
					placeholder="请输入远程图标地址"
				/>
			</div>
			<div class="mt-4 flex justify-center">
				<el-button @click="innerVisible = false">关闭</el-button>
				<el-button type="primary" @click="hanldeSaveRemoteIcon(remoteIcon)">
					保存远程图标
				</el-button>
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
		type: Boolean,
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

const maxLengthTitle = 100
const maxLengthDescription = 200
const defaultCategory = '默认'
const formRef = ref()
const formItemRef = ref()
const form = computed<any>({
	get: () => props.formData,
	set: (v: any) => emits('update:formData', v)
})

const rules = ref({
	url: [
		{ required: true, message: '请输入网站链接 URL', trigger: 'blur' },
		{
			validator: (rule: any, value: string, callback: any) => {
				if (!/^https?:\/\//.test(value)) {
					callback(new Error('链接必须以 http 或 https 开头'))
					return
				}

				try {
					new URL(value)
					callback()
				} catch {
					callback(new Error('请输入合法的链接'))
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

watch(innerVisible, () => {
	isInValid.value = false
})

const validateWebsiteUrl = (formItemEl: FormItemInstance | undefined) => {
	if (!formItemEl) return
	return new Promise(resolve => {
		formItemEl.validate('change', valid => {
			if (!valid) return false
			resolve(valid)
		})
	})
}

const handleGetWebContent = async (formItemEl: FormItemInstance | undefined, url: string) => {
	if (!url) return ElMessage.error('请输入网站地址 URL')
	try {
		await validateWebsiteUrl(formItemEl)
		isGetWebContentLoading.value = true
		const { statusCode, statusMessage, data = {} }: any = await useApiGetWebContent({ url })
		if (statusCode) throw new Error(statusMessage)
		form.value.icon = (data.icon || useWebsiteIcon(data.url, '')).trim()
		form.value.title = (data.title.slice(0, maxLengthTitle) || data.url).trim()
		form.value.description = (data.description || '').slice(0, maxLengthDescription).trim()
	} catch {
		ElMessage.error('抓取失败')
	} finally {
		isGetWebContentLoading.value = false
	}
}

const handleConfirm = async (formEl: FormInstance | undefined) => {
	if (!formEl) return
	await formEl.validate(valid => {
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
	} catch {
		isInValid.value = true
		ElMessage.error('请输入正确的图片地址')
	}
}

const checkImageUrlValid = (url: string) => {
	return new Promise((resolve, reject) => {
		let hasTriedProxy = false
		const img = new Image()
		img.referrerPolicy = 'no-referrer'
		img.src = url
		img.addEventListener('load', () => resolve(img.src))
		img.addEventListener('error', () => {
			if (hasTriedProxy) {
				reject(new Error('invalid image'))
				return
			}
			hasTriedProxy = true
			img.src = '/api/proxy/' + encodeURIComponent(url)
		})
	})
}

const clearForm = (payload: Record<string, any> = {}) => {
	formRef.value?.resetFields()
	form.value = { ...payload }
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
