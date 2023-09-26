import { Renderer, parse, use } from 'marked'
import { markedEmoji } from 'marked-emoji'
import emojis from './emojis.json'
import xss from 'xss'

use(
	markedEmoji({
		emojis,
		unicode: false
	})
)
const emojiReg = /\[[^\s]*?\]/g

// 参考：https://marked.js.org/using_pro#renderer
const renderer = {
	link(href: string, title: string, text: string) {
		try {
			new URL(href)
			return `<a href="${href}" target="_blank">${text}</a>`
		} catch {
			return `[${text}](${href})`
		}
	},
	list(body: string, ordered: boolean, start: string) {
		const type = ordered ? 'ol' : 'ul'

		// const html = body
		// 	.match(/(<li[^>]*>(?:.|\n)*?<\/li>)/g)!
		// 	.reduce((res: any[], cur: string, index: number) => {
		// 		const isCurTask = cur.includes('task-list-item')
		// 		if (!res.length || isCurTask !== isPrevTask) {
		// 			res.push([cur])
		// 		} else {
		// 			res[res.length - 1].push(cur)
		// 		}
		// 		isPrevTask = isCurTask
		// 		return res
		// 	}, [])
		// 	.map(
		// 		item =>
		// 			`<${type}${item[0].includes('task-list-item') ? ' class="task-list"' : ''}>${item.join(
		// 				''
		// 			)}</${type}>`
		// 	)
		// 	.join('')

		return `<${type}${
			body.includes('task-list-item') ? ' class="task-list"' : ''
		}>${body}</${type}>`
	},
	listitem(text: string, task: boolean, checked: boolean) {
		if (emojiReg.test(text)) return text
		let taskListItemClass = ''

		if (task) {
			taskListItemClass = 'class="task-list-item"'
		} else {
		}

		return `<li ${taskListItemClass}>${text.replace(
			'<input',
			'<input class="task-list-item-checkbox"'
		)}</li>`
	},
	blockquote(src: string) {
		return `<blockquote>${src
			.replace(/\n$/, '')
			.replace(/<p([^>]*)>((?:.|\n)*?)<\/p>/g, match =>
				match.replace('\n', '<br />')
			)}</blockquote>`
	}
}

/**
 *
 * @param {*} value
 * @returns
 */
function getHtmlStr(value: string) {
	return parse(
		xss(value.replace(/^[\u200B\u200C\u200D\u200E\u200F\uFEFF]/g, ''), {
			whiteList: {
				a: ['href', 'rel', 'target', 'title'],
				b: [],
				bdi: ['dir'],
				bdo: ['dir'],
				big: [],
				blockquote: ['cite'],
				br: [],
				caption: [],
				center: [],
				cite: [],
				code: [],
				col: ['align', 'valign', 'width'],
				colgroup: ['align', 'valign', 'width'],
				dd: [],
				del: ['datetime'],
				details: ['open'],
				div: ['style', 'align', 'title'],
				dl: [],
				dt: [],
				em: [],
				font: ['color', 'size', 'face', 'style'],
				h1: ['align', 'title'],
				h2: ['align', 'title'],
				h3: ['align', 'title'],
				h4: ['align', 'title'],
				h5: ['align', 'title'],
				h6: ['align', 'title'],
				hr: [],
				i: [],
				img: ['alt', 'src', 'title', 'width', 'height'],
				ins: ['datetime'],
				li: [],
				mark: [],
				ol: ['start'],
				p: ['style', 'align', 'title'],
				picture: ['alt', 'src', 'title', 'width', 'height'],
				pre: [],
				q: [],
				rp: [],
				rt: [],
				ruby: [],
				s: [],
				samp: [],
				section: [],
				small: [],
				source: [],
				span: [],
				strong: [],
				strike: [],
				summary: [],
				sub: [],
				sup: [],
				table: ['align', 'cellpadding', 'cellspacing'],
				tbody: [],
				tfoot: [],
				thead: [],
				tr: [],
				th: ['align', 'colspan', 'headers', 'rowspan', 'scope', 'valign'],
				td: ['align', 'colspan', 'headers', 'rowspan', 'scope', 'valign'],
				tt: [],
				u: [],
				ul: [],
				var: []
				// audio: ['autoplay', 'controls', 'loop', 'preload', 'src'],
				// video: ['autoplay', 'controls', 'loop', 'preload', 'src', 'height', 'width']
			},
			// 自定义匹配到不在白名单上的标签时的处理方法
			onIgnoreTag(tag, html, options) {
				if (/^(https|http):\S+$|^(kbd)$|^.{0}$/gi.test(tag)) {
					return html
				} else if (['iframe', 'noframes', 'style', 'textarea', 'title', 'xmp'].includes(tag)) {
					return html.replace(/</g, '&lt;').replace(/>/g, '&gt;')
				} else if (/^\w+$/.test(tag) && !/\n/.test(html)) {
					return ''
				}
			},
			escapeHtml(html) {
				// 仅对需要正常显示，但又不属于元素的尖括号进行转义
				return html.replace(/<[^/-][^>\n,]*>|<.+?\/>/g, match => {
					return /:\s+/.test(match) ? match : match.replace(/</g, '&lt;').replace(/>/g, '&gt;')
				})
			}
		}),
		{
			renderer: Object.assign(new Renderer(), renderer)
		}
	)
}

export const useMarked = (value: string = '') => getHtmlStr(value)
