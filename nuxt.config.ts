/*
 * @Author: iuukai
 * @Date: 2023-08-15 01:10:40
 * @LastEditors: iuukai
 * @LastEditTime: 2023-09-17 23:08:45
 * @FilePath: \iki-bookmark-nuxt3\nuxt.config.ts
 * @Description:
 * @QQ/微信: 790331286
 */
// import { pwa } from './config/pwa'
// import Components from 'unplugin-vue-components/vite'
// import { DevUiResolver } from 'unplugin-vue-components/resolvers'

// https://v3.nuxtjs.org/api/configuration/nuxt.config
export default defineNuxtConfig({
	modules: [
		'dayjs-nuxt',
		'nuxt-icon',
		'nuxt-lodash',
		'@pinia/nuxt',
		'@vueuse/nuxt',
		// '@vite-pwa/nuxt',
		'nuxt-lazy-hydrate',
		'@element-plus/nuxt',
		'@nuxtjs/tailwindcss',
		'@nuxtjs/stylelint-module',
		[
			'@nuxtjs/google-fonts',
			{
				families: {
					Roboto: true,
					'Josefin+Sans': true,
					Lato: [100, 300],
					Raleway: {
						wght: [100, 400],
						ital: [100]
					}
				},
				subsets: ['latin'],
				display: 'swap',
				prefetch: false,
				preconnect: false,
				preload: false,
				download: true,
				base64: false
			}
		]
	],
	// pwa,
	// experimental: {
	// 	externalVue: true	// 勿 false，否则打包出错
	// },
	runtimeConfig: {
		public: {
			baseURL: 'https://ibookmark.onrender.com/'
		}
	},
	alias: {},
	build: {
		transpile: [/echarts/]
	},
	app: {
		// ssr 页面开启过渡动画后，切换页面过快会导致 dom 未加载报错
		// pageTransition: { name: 'page', mode: 'out-in' },
		head: {
			charset: 'utf-8',
			viewport: 'width=device-width, initial-scale=1',
			title: 'iBookmark',
			htmlAttrs: {
				lang: 'zh-cn'
			},
			meta: [
				{ charset: 'utf-8' },
				{ name: 'viewport', content: 'width=device-width, initial-scale=1' }
				// { hid: 'description', name: 'description', content: 'Nuxt.js project' }
			],
			script: []
		},
		keepalive: false
	},
	devtools: {
		enabled: true
	},
	postcss: {
		plugins: {
			autoprefixer: {}
		}
	},
	typescript: {
		strict: true,
		shim: false
	},
	dayjs: {
		locales: ['zh', 'en'],
		plugins: ['relativeTime', 'utc', 'timezone'],
		defaultLocale: 'zh',
		defaultTimezone: 'PRC'
	},
	css: ['~/assets/styles/index.less'],
	elementPlus: {
		importStyle: 'css',
		themes: ['dark'],
		icon: false,
		namespace: 'el',
		injectionID: { prefix: 1024, current: 0 }
	},
	plugins: ['@/plugins/useDirective', '@/plugins/useLaunchInit'],
	vite: {
		logLevel: 'silent',
		build: {
			cssCodeSplit: true,
			terserOptions: {
				compress: {
					drop_console: true,
					drop_debugger: true
				}
			}
		},
		plugins: [],
		css: {
			preprocessorOptions: {
				less: {
					javascriptEnabled: true,
					// 变量
					additionalData: '@import "~/assets/styles/variables.less";'
				}
			}
		}
	},
	ssr: true
})
