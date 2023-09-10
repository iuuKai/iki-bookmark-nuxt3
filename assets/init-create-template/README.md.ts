/*
 * @Author: iuukai
 * @Date: 2023-09-03 11:12:34
 * @LastEditors: iuukai
 * @LastEditTime: 2023-09-03 18:03:50
 * @FilePath: \iki-bookmark-nuxt3\assets\init-create-template\README.md.ts
 * @Description:
 * @QQ/微信: 790331286
 */
import { useAuthorStore } from '@/store/modules/author'

const authorStore = useAuthorStore()
const config = useRuntimeConfig()
const baseURL = config?.public?.baseURL

const url = baseURL || 'http://localhost:3000/'

const README = `# iBookmark 私人书签仓库

<p align="center">
  <a href="${url}">
    <img width="200" src="${url}/favicon.ico">
  </a>
</p>

<h1 align="center">
  <a href="${url}" target="_blank">iBookmark</a>
</h1>

- [x] iBookmark 书签管理
- [x] 支持图片、笔记、网页收藏
- [x] 支持自定义收藏分类、标签
- [x] 支持导出书签、笔记、网页
- [x] 免费且私密性的：数据存储于 GitHub/Gitee 私人仓库

## 目录结构

- \`config.ibbookmark.js\`: iBookmark 私人配置文件
- \`website\/\`: 私人网站收藏
- \`note\/\`: 私人笔记收藏
- \`image\/\`: 私人图片收藏

**Author**: **${authorStore.AUTHOR.name}**

**Email**: ${authorStore.AUTHOR.email}

**GitHub**: [${authorStore.AUTHOR.github}](${authorStore.AUTHOR.github})

**Gitee**: [${authorStore.AUTHOR.gitee}](${authorStore.AUTHOR.gitee})
`

export default README
