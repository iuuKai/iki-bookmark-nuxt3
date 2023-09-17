<!--
 * @Author: iuukai
 * @Date: 2023-09-14 19:12:22
 * @LastEditors: iuukai
 * @LastEditTime: 2023-09-16 23:20:36
 * @FilePath: \iki-bookmark-nuxt3\components\common\dialog\update-category.vue
 * @Description: 
 * @QQ/微信: 790331286
-->
<template>
	<div class="bm-update-category_wrapper">
		<el-form ref="formRef" :model="form" :rules="rules">
			<el-form-item prop="category">
				<el-input
					v-model="form.category"
					:disabled="form.category === '默认'"
					size="large"
					placeholder="请输入名称"
					clearable
				/>
			</el-form-item>
		</el-form>
		<div class="mt-4 text-right">
			<el-button :disabled="isSubmitLoading" @click="emits('cancel')">关闭</el-button>
			<el-button :loading="isSubmitLoading" type="primary" @click="handleConfirm(formRef)">
				立即保存
			</el-button>
		</div>
	</div>
</template>

<script setup lang="ts">
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

const formRef = ref()
const form = computed<any>({
	get: () => props.formData,
	set: (v: any) => emits('update:formData', v)
})
const rules = ref({
	category: [
		{ required: true, message: '请输入名称', trigger: 'blur' },
		{
			validator: (rule: any, value: any, callback: any) => {
				const curCategoryId = form.value.id
				const curCategoryName =
					props.categoryList.find((item: any) => item.value === curCategoryId)?.label ?? ''
				if (/^默认$/.test(value) && curCategoryName !== '默认') {
					callback(new Error('该名称不允许，请重新输入'))
				} else {
					callback()
				}
			},
			trigger: 'change'
		}
	]
})

const handleConfirm = async (formEl: FormInstance | undefined) => {
	if (!formEl) return
	await formEl.validate((valid, fields) => {
		if (!valid) return false
		emits('confirm')
	})
}

const clearForm = () => {
	form.value = {}
	if (formRef.value) {
		formRef.value.resetFields()
	}
}

defineExpose({
	clearForm
})
</script>

<style scoped lang="less"></style>
