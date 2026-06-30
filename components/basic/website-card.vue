<template>
	<div class="bm-website_card">
		<a class="bm-website" :href="url" target="_blank">
			<div class="bm-website_header" :title="title">
				<BasicImage class="w-10 h-10" :src="iconUrl" fit="contain" lazy circle />
				<el-text class="bm-website_title" truncated tag="div">{{ title }}</el-text>
				<div
					:class="['bm-website_bar', { 'is-star': isStar }]"
					@click.stop.prevent="handleClickStar"
				>
					<el-text tag="div" v-permissions="[LOGIN_NAME, HASREPO_NAME]">
						<ClientOnly>
							<template v-if="isStar">
								<Icon name="ic:round-star" size="1rem" />
								已收藏
							</template>
							<template v-else>
								<Icon name="ic:round-star-outline" size="1rem" />
								收藏
							</template>
						</ClientOnly>
					</el-text>
				</div>
			</div>
			<div class="bm-website_content">
				<el-text class="!self-start line-clamp-2" tag="div" :title="description">
					{{ description }}
				</el-text>
			</div>
		</a>
	</div>
</template>

<script setup lang="ts">
import { LOGIN_NAME, HASREPO_NAME } from '@/permissions'

const emits = defineEmits(['star-change'])
const props = defineProps({
	isStar: {
		type: Boolean,
		default: false
	},
	title: {
		type: String,
		default: ''
	},
	url: {
		type: String,
		default: ''
	},
	icon: {
		type: String,
		default: ''
	},
	likes: {
		type: Number,
		default: 0
	},
	unlikes: {
		type: Number,
		default: 0
	},
	description: {
		type: String,
		default: ''
	}
})

const iconUrl = computed(() => useWebsiteIcon(props.url, props.icon))

const handleClickStar = () => {
	emits('star-change')
}
</script>

<style scoped lang="less">
.bm-website_card {
	&:hover .bm-website {
		@apply -translate-y-1 shadow-xl;

		.bm-website_header {
			.bm-website_bar {
				@apply opacity-100;
			}
		}
	}

	.bm-website {
		@apply relative p-3 h-28 flex flex-col rounded-lg bg-white/60 select-none overflow-hidden;
		@apply shadow-md transition duration-300;

		.bm-website_header {
			@apply flex;

			.bm-website_title {
				@apply ml-2 font-bold;
			}

			.bm-website_bar {
				@apply absolute top-0 right-0 p-1 pr-3;
				@apply opacity-0 transition duration-300;

				&.is-star {
					@apply opacity-100;
				}
			}
		}

		.bm-website_content {
			@apply mt-2;
		}
	}
}
</style>
