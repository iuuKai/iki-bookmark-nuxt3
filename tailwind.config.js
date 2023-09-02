/*
 * @Author: iuukai
 * @Date: 2023-08-06 16:58:20
 * @LastEditors: iuukai
 * @LastEditTime: 2023-08-16 01:13:30
 * @FilePath: \iki-bookmark-nuxt3\tailwind.config.js
 * @Description:
 * @QQ/微信: 790331286
 */
/** @type {import('tailwindcss').Config} */
import plugin from 'tailwindcss/plugin'

export default {
	content: [
		'./components/**/*.{js,vue,ts}',
		'./layouts/**/*.vue',
		'./pages/**/*.vue',
		'./plugins/**/*.{js,ts}',
		'./app.vue'
	],
	darkMode: 'class',
	theme: {
		extend: {}
	},
	variants: {
		extends: {}
	},
	plugins: [
		plugin(({ addComponents, theme }) => {
			addComponents({
				'.text-none': {
					fontSize: '0'
				}
			})
		})
	]
}
