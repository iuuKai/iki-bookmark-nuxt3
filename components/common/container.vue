<!--
 * @Author: iuukai
 * @Date: 2023-08-16 08:01:20
 * @LastEditors: iuukai
 * @LastEditTime: 2023-09-16 02:38:57
 * @FilePath: \iki-bookmark-nuxt3\components\common\container.vue
 * @Description: 
 * @QQ/微信: 790331286
-->
<template>
	<el-row
		:class="{
			'h-full': fullHeight
		}"
		justify="center"
	>
		<el-col
			:class="{
				'h-full': fullHeight
			}"
			:md="22"
			:lg="18"
		>
			<div
				:class="[
					flexClass,
					...[customClass].flat(),
					{ 'h-full': fullHeight, 'overflow-hidden': overHide }
				]"
			>
				<slot />
			</div>
		</el-col>
	</el-row>
</template>

<script setup lang="ts">
interface AlignMap {
	top: string
	middle: string
	bottom: string
}

type Align = 'top' | 'middle' | 'bottom'
type Justify = 'start' | 'end' | 'center' | 'around' | 'between'

const props = defineProps({
	flex: {
		type: Boolean,
		default: false
	},
	overHide: {
		type: Boolean,
		default: false
	},
	fullHeight: {
		type: Boolean,
		default: false
	},
	align: {
		type: String as PropType<Align>,
		default: 'top'
	},
	justify: {
		type: String as PropType<Justify>,
		default: 'start'
	},
	customClass: {
		type: [String, Array],
		default: ''
	}
})

const flexClass = computed(() => {
	const { flex, align, justify }: { flex: boolean; align: Align; justify: Justify } = props
	const alignMap: AlignMap = {
		top: 'start',
		middle: 'center',
		bottom: 'end'
	}
	return (flex && `flex justify-${justify} items-${alignMap[align]}`) || ''
})
</script>

<style scoped lang="less"></style>
