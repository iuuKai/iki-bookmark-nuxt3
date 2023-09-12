<!--
 * @Author: iuukai
 * @Date: 2023-08-08 13:03:26
 * @LastEditors: iuukai
 * @LastEditTime: 2023-09-11 23:54:29
 * @FilePath: \iki-bookmark-nuxt3\layouts\default.vue
 * @Description: 
 * @QQ/微信: 790331286
-->
<template>
	<el-container class="bm-layout">
		<CommonBgFull />
		<el-main class="bm-layout-content">
			<CommonContainer flex fullHeight overHide customClass="p-10">
				<div class="bm-content-wrapper">
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
		<el-footer class="bm-layout-footer">
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
			@apply flex flex-1 h-full rounded-3xl backdrop-blur-md bg-white/60 overflow-hidden;

			.bm-scroll-wrapper {
				@apply mr-3 pr-3 pl-6 mb-6 h-full overflow-y-auto;
			}
		}
	}

	.bm-layout-footer {
		@apply h-10 text-sm text-white bg-black/60 backdrop-blur-md;
	}
}
</style>
