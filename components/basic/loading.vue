<!--
 * @Author: iuukai
 * @Date: 2023-09-26 18:27:52
 * @LastEditors: iuukai
 * @LastEditTime: 2023-09-30 23:42:56
 * @FilePath: \iki-bookmark-nuxt3\components\basic\loading.vue
 * @Description: 
 * @QQ/微信: 790331286
-->

<template>
	<div :class="['bm-chase_wrap', { absolute: full, fixed: screen, 'rounded-full': circle }]">
		<div class="bm-chase" :style="{ width: size, height: size }">
			<div class="bm-chase_dot"></div>
			<div class="bm-chase_dot"></div>
			<div class="bm-chase_dot"></div>
			<div class="bm-chase_dot"></div>
			<div class="bm-chase_dot"></div>
			<div class="bm-chase_dot"></div>
		</div>
	</div>
</template>

<script setup lang="ts">
defineProps({
	size: {
		type: String,
		default: '50%'
	},
	circle: {
		type: Boolean,
		default: false
	},
	full: {
		type: Boolean,
		default: false
	},
	screen: {
		type: Boolean,
		default: false
	}
})
</script>

<style scoped lang="less">
.bm-chase_wrap {
	@apply w-full h-full flex justify-center items-center bg-zinc-800/50;

	.bm-chase {
		animation: bm-chase 2.5s infinite linear both;

		.bm-chase_dot {
			animation: bm-chase_dot 2s infinite ease-in-out both;
			@apply absolute left-0 top-0 w-full h-full;
			@apply before:block before:w-1/4 before:h-1/4 before:bg-white before:rounded-full;

			&::before {
				animation: bm-chase_dot-before 2s infinite ease-in-out both;
			}

			&:nth-child(1) {
				&,
				&::before {
					animation-delay: -1.1s;
				}
			}

			&:nth-child(2) {
				&,
				&::before {
					animation-delay: -1s;
				}
			}

			&:nth-child(3) {
				&,
				&::before {
					animation-delay: -0.9s;
				}
			}

			&:nth-child(4) {
				&,
				&::before {
					animation-delay: -0.8s;
				}
			}

			&:nth-child(5) {
				&,
				&::before {
					animation-delay: -0.7s;
				}
			}

			&:nth-child(6) {
				&,
				&::before {
					animation-delay: -0.6s;
				}
			}
		}
	}
}

@keyframes bm-chase {
	100% {
		transform: rotate(360deg);
	}
}

@keyframes bm-chase_dot {
	80%,
	100% {
		transform: rotate(360deg);
	}
}

@keyframes bm-chase_dot-before {
	50% {
		transform: scale(0.4);
	}

	100%,
	0% {
		transform: scale(1);
	}
}
</style>
