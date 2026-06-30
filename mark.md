# iki-bookmark-nuxt3 项目分析

## 项目作用

`iki-bookmark-nuxt3` 是一个基于 `Nuxt 3 + Pinia + Element Plus + Nitro` 的在线书签导航项目。

它支持两种使用模式：

- 游客模式：浏览公共书签导航。
- 登录模式：通过 `GitHub / Gitee OAuth` 登录后管理个人书签。

登录用户可以把书签数据、图片等内容保存到自己的仓库中，实现“前台导航 + 私有仓库存储”的轻量化个人书签系统。

## 项目亮点

- 双模式设计。游客可直接使用，登录后无缝切换到个人数据管理。
- 数据托管在用户自己的仓库，弱中心化，迁移成本低。
- 支持通过输入 URL 自动抓取网站标题、描述和图标，降低录入成本。
- 书签数据结构清晰，分类与网址拆分明确，便于后续统计、搜索、同步和二次开发。
- 前后端同仓，服务端接口直接由 Nuxt/Nitro 提供，开发和部署链路简单。

## 难点与处理方法

### 1. OAuth 登录打通

难点：

- 需要兼容 GitHub 和 Gitee 两套授权链路。
- 前端需要感知登录态，服务端需要正确透传 token 和仓库请求。

处理方法：

- 将授权入口统一收口到服务端 API。
- 使用 Pinia 管理用户状态、token 和仓库信息。
- 页面通过中间件控制访问权限，例如登录校验、仓库存在校验。

### 2. 书签数据落仓

难点：

- 用户操作会直接影响远端仓库文件，必须处理 sha、更新、创建、删除等逻辑。

处理方法：

- 在 `store/modules/repo.ts` 中统一管理仓库文件读写。
- 通过 `apiGetRepoFileData / apiUpdateRepoFileData / apiCreateRepoFileData` 封装仓库文件操作。
- 同步维护 `dataJSON` 与 `flatDataJSON`，兼顾展示和快速查询。

### 3. 网站图标抓取与兼容

难点：

- 不同网站的 icon 声明方式不统一。
- 有的网站直接有 `link[rel*=icon]`，有的只有 `/favicon.ico`。
- 如果页面渲染时每个图标都走复杂校验，会明显拖慢首屏。

处理方法：

- 书签录入阶段在 `server/api/get-web-content.get.ts` 中只解析页面元信息和 icon 候选，不再额外阻塞验证图标地址。
- 图标解析优先级改为：
  1. 页面显式声明的 `icon / shortcut icon / apple-touch-icon`
  2. 站点根路径 `/favicon.ico`
- 前端渲染阶段使用轻量回退策略：
  1. 优先使用已保存 icon
  2. 没有时根据网址直接推导 `origin/favicon.ico`
  3. 加载失败时再回退到代理接口或错误占位

## 本次优化内容

### 图标链路优化

- 移除了服务端对 `favicon.ico` 的二次阻塞探测。
- 新增 `composables/useWebsiteIcon.ts`，统一处理 icon 选择逻辑。
- 优化代理接口 `server/api/proxy/[...url].ts`，支持解码后的远程资源代理。

收益：

- 添加书签时更快返回。
- 页面渲染时不必等待额外服务端校验。
- 对大部分普通站点，直接使用 `origin/favicon.ico` 即可完成展示。

### 图片渲染优化

- 重写 `components/basic/image.vue`。
- 移除“每张图一个 Web Worker”的方案，避免大量 worker 实例造成调度和内存开销。
- 改为原生 `Image` 对象加载。
- 增加 `loading="lazy"`、`decoding="async"`、`referrerpolicy="no-referrer"`。
- 严格按视区触发加载，避免 `lazy=true` 时提前请求。

收益：

- 显著降低大量图标同时存在时的主线程和调度压力。
- 减少不必要的对象创建和 blob URL 生成。

### 列表渲染优化

- 新增 `components/basic/lazy-block.vue`。
- 分类卡片 `components/basic/category-card.vue` 改为进入视区后再渲染内部书签列表。
- 书签列表采用分批增加 `renderCount` 的方式，避免一次性挂载过多子组件。

收益：

- 首屏只渲染真正可见区域。
- 大量分类、大量书签时页面打开明显更稳。

### 组件实例开销优化

- `website-card.vue` 和 `website-simple-card.vue` 移除了批量 `el-tooltip` 实例。
- 描述信息改为更轻量的 `title` 属性展示。
- 首页收藏判断由线性查找改为 `Set` 查询。

收益：

- 降低每张卡片的组件树复杂度。
- 减少高频响应式计算。

### 管理页兼容修复

- 重写 `pages/bookmarks.vue`，统一书签管理命令文本与业务分支。
- 重写 `components/common/dialog/update-website.vue`，规范新增/编辑书签表单逻辑。

收益：

- 命令文本和逻辑分支对齐，避免旧编码字符串带来的隐性 bug。
- 录入、编辑、批量处理流程更稳定。

## 技术点总结

- `Nuxt 3 / Nitro`：统一 SSR、前端页面和服务端接口。
- `Pinia`：统一管理用户态、仓库态和文件数据。
- `Element Plus`：表单、弹窗、消息提示、下拉菜单。
- `VueUse`：交叉观察器等能力用于懒渲染和视区判断。
- `JSDOM`：服务端解析网页标题、描述和 icon 节点。
- `OAuth`：打通 GitHub / Gitee 登录授权。
- `Repo as Database`：将 JSON 文件作为轻量数据源，存放到用户私人仓库。

## 适合博客表达的结论

这个项目的核心并不是“做一个书签页”，而是把“个人导航、OAuth 登录、远端仓库存储、内容抓取、前端性能优化”这些点串成一个完整可用的产品。

它比较有价值的地方在于：

- 业务闭环完整。
- 数据 ownership 清晰，用户掌控自己的书签数据。
- 工程实现兼顾体验和成本。
- 在大量图标、小卡片密集渲染场景下，具备较强的优化实践价值。
