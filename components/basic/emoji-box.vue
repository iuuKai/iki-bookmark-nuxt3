<!--
 * @Author: iuukai
 * @Date: 2023-09-23 13:42:38
 * @LastEditors: iuukai
 * @LastEditTime: 2023-09-26 10:05:06
 * @FilePath: \iki-bookmark-nuxt3\components\basic\emoji-box.vue
 * @Description: 
 * @QQ/微信: 790331286
-->
<template>
	<ClientOnly>
		<el-popover
			width="358"
			placement="bottom-start"
			popper-class="bm-emoji_box"
			trigger="click"
			@show="emits('emoji-box-show')"
			@hide="emits('emoji-box-hide')"
			@before-enter="emits('before-emoji-box-show')"
			@before-leave="emits('before-emoji-box-hide')"
			@after-enter="emits('after-emoji-box-show')"
			@after-leave="emits('after-emoji-box-hide')"
		>
			<template #reference>
				<el-button :class="['bm-comment_emoji', show ? 'visible' : 'invisible']">
					<el-space>
						<Icon name="bi:emoji-smile" />
						<span>表情</span>
					</el-space>
				</el-button>
			</template>
			<template #default>
				<el-tabs
					class="bm-emoji_tabs"
					v-model="curEmojiTabIndex"
					type="border-card"
					tab-position="bottom"
				>
					<el-tab-pane v-for="(tab, i) in emoji" :key="tab.id" :name="i">
						<template #label>
							<el-image class="w-5 h-5" :src="imgProxy(tab.url)" />
						</template>
						<template #default>
							<div class="bm-emoji_title">
								<el-text>{{ curEmojiGroup.text }}</el-text>
							</div>
							<el-scrollbar view-class="bm-emoji_wrap">
								<div
									v-for="emoji in curEmojiGroup.emote"
									:key="emoji.id"
									:class="[
										'emoji-list',
										{
											'is-normal': tab.meta.size === 1,
											'is-large': tab.meta.size === 2,
											'is-text': tab.type === 4
										}
									]"
									@click="emits('emoji-click', emoji.text)"
								>
									<el-image
										v-if="tab.type === 1 && emoji.url !== emoji.text"
										:key="emoji.id"
										:src="imgProxy(emoji.url)"
										:title="emoji.text"
									/>
									<el-text v-else :title="emoji.text" tag="div">
										{{ emoji.text }}
									</el-text>
								</div>
							</el-scrollbar>
						</template>
					</el-tab-pane>
				</el-tabs>
			</template>
		</el-popover>
	</ClientOnly>
</template>

<script setup lang="ts">
import { useCommentStore } from '@/store/modules/comment'

const emits = defineEmits([
	'emoji-click',
	'emoji-box-show',
	'emoji-box-hide',
	'before-emoji-box-show',
	'before-emoji-box-hide',
	'after-emoji-box-show',
	'after-emoji-box-hide'
])
defineProps({
	show: {
		type: Boolean,
		default: false
	}
})

const commentStore = useCommentStore()

const curEmojiTabIndex = ref<number>(0)
const emoji = computed<any>(() => commentStore.emoji)
const curEmojiGroup = computed<any[]>(() => emoji.value?.[curEmojiTabIndex.value] ?? {})
const imgProxy = computed(() => (url: string) => `/api/proxy/${url}`)
</script>

<style lang="less">
.bm-emoji_box {
	@apply !p-0 select-none;

	.bm-emoji_wrap {
		@apply h-40 flex flex-wrap;

		.emoji-list {
			@apply p-1 w-8 h-8 rounded-md cursor-pointer duration-300;

			&.is-text {
				@apply px-2 py-2 w-auto h-auto leading-none;
			}

			&.is-large {
				@apply w-16 h-16;
			}

			&:hover {
				@apply bg-gray-300/80;
			}
		}
	}

	.bm-emoji_tabs {
		@apply border-none;

		.el-tabs__content {
			@apply pb-0 pr-2;
		}

		.el-tabs__header.is-bottom {
			@apply mt-0;
		}
	}
}
</style>
