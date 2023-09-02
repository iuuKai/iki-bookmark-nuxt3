<!--
 * @Author: iuukai
 * @Date: 2023-08-08 13:03:26
 * @LastEditors: iuukai
 * @LastEditTime: 2023-09-01 20:07:32
 * @FilePath: \iki-bookmark-nuxt3\layouts\default.vue
 * @Description: 
 * @QQ/微信: 790331286
-->
<template>
	<el-container class="bm-layout">
		<CommonBgFull />
		<el-main class="bm-layout-content" ref="mainRef">
			<CommonContainer flex fullHeight overHide customClass="p-10">
				<div class="bm-content-wrapper" ref="wrapRef">
					<el-aside width="220px">
						<LayoutAside @menu-click="curMenuTitle = $event" />
					</el-aside>
					<section class="flex-auto flex flex-col">
						<LayoutHeader :menu-title="curMenuTitle" />
						<div class="bm-scroll-wrapper">
							<slot />
						</div>
					</section>
					<el-backtop target=".bm-scroll-wrapper" :right="20" :bottom="20" />
				</div>
			</CommonContainer>
		</el-main>
		<el-footer class="bm-layout-footer" ref="footerRef">
			<CommonContainer flex justify="center" align="middle" fullHeight>
				<LayoutFooter />
			</CommonContainer>
		</el-footer>
	</el-container>
	<ClientOnly>
		<CommonLoginDialog />
		<CommonCreateDialog />
	</ClientOnly>
</template>

<script setup lang="ts">
const curMenuTitle = ref('')
</script>

<style lang="less" scoped>
.bm-layout {
	@apply h-screen overflow-hidden;

	.bm-layout-content {
		.bm-content-wrapper {
			@apply p-5 flex flex-1 h-full rounded-3xl backdrop-blur-md bg-white/60;

			.bm-scroll-wrapper {
				@apply px-5 h-full overflow-y-auto;
			}
		}
	}

	.bm-layout-footer {
		@apply h-10 text-sm text-white bg-black/60 backdrop-blur-md;
	}
}
</style>
