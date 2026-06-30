# 从“能用”到“流畅”：一个 Nuxt3 书签项目的性能与工程化实战

## 1. 项目背景

`iki-bookmark-nuxt3` 是一个在线书签导航项目：

- 游客模式：查看公共导航。
- 登录模式：通过 GitHub/Gitee OAuth 登录后管理个人书签。
- 数据存储：书签数据写入用户自己的仓库（Repo as Database）。

项目早期功能完整，但在“书签数量上来后”出现了典型问题：  
首屏渲染不稳定、icon 大量 loading 时卡顿、菜单动画掉帧、lint/ts 报错链式出现。

## 2. 关键亮点

### 2.1 Repo as Database

把 JSON 文件存放在用户仓库，通过 API 做读写，避免维护独立数据库。  
这让项目轻量、可迁移、用户数据 ownership 清晰。

### 2.2 图标获取策略分层

录入阶段：提取网站标题、描述、icon 候选。  
渲染阶段：优先本地 icon -> 推导 `origin/favicon.ico` -> 失败后代理回退。  
这样比“每次都强校验 icon 可达性”更快、更稳。

### 2.3 前后端一体化

Nuxt3 同时承载页面和 server API，调试效率高，工程链路短。

## 3. 遇到的困难与处理方法

## 3.1 骨架态卡死

问题：页面长时间停留在骨架。  
根因：请求层失败时 Promise 没有可靠 reject，导致调用方一直 await。

处理：

- 请求封装保证每个请求都有终态（resolve/reject）。
- 页面 loading 状态统一收口，避免“骨架 -> 内容 -> 骨架”的闪动。

## 3.2 菜单动画在 icon 批量 loading 时卡顿

问题：左侧菜单 hover/切换掉帧。  
根因：icon 同时 loading 抢占主线程，动画方案还包含较重重绘。

处理：

- 菜单动画改为 transform 驱动；
- 指示条首帧先定位，再启用过渡（避免从 0 跳动）；
- icon loading 改静态占位；
- 增加图片加载并发队列，限制瞬时并发。

## 3.3 工程规则报错“越修越多”

问题：stylelint/ts 的规则和配置升级后出现连锁告警。  
处理：

- 清理已废弃 stylelint 规则；
- 修正 TS 配置兼容项；
- 对新增代码补齐类型，保证 `vue-tsc` 可通过；
- 用“先全量扫描，再批量修复，再复验”替代逐条修。

## 4. 具体优化点

1. 图片加载并发控制  
- 新增加载队列，限制同时加载的 icon 数量，降低主线程压力。

2. 视区渲染与分批挂载  
- 分类内容进入视区后再渲染；
- 列表分批渲染，减少首次挂载峰值。

3. 降低组件实例成本  
- 移除不必要的批量 tooltip；
- 优化高频查找逻辑（如使用 `Set`）。

4. 动画降载  
- 菜单指示条动画只使用 transform；
- 页面过渡时长和位移收敛，减少卡顿体感。

## 5. Demo：一个可复用的图片并发加载队列（Vue 3）

下面是一个最小可用 demo，用来限制 icon 并发加载：

```ts
// composables/useImageLoadQueue.ts
type Task = () => void

const MAX = 10
const queue: Task[] = []
let active = 0

function runNext() {
  while (active < MAX && queue.length) {
    const task = queue.shift()
    if (!task) break
    active++
    task()
  }
}

export function useImageLoadQueue() {
  function enqueue(task: (done: () => void) => void) {
    let started = false
    let finished = false

    const done = () => {
      if (finished) return
      finished = true
      active = Math.max(active - 1, 0)
      runNext()
    }

    const start = () => {
      started = true
      task(done)
    }

    if (active < MAX) {
      active++
      start()
    } else {
      queue.push(start)
    }

    // 允许组件卸载时取消未开始任务
    return () => {
      if (started) return
      const i = queue.indexOf(start)
      if (i > -1) queue.splice(i, 1)
    }
  }

  return { enqueue }
}
```

在图片组件里使用：

```ts
const { enqueue } = useImageLoadQueue()
let cancelTask: null | (() => void) = null

function load() {
  cancelTask = enqueue((done) => {
    const img = new Image()
    img.src = src.value
    img.onload = () => { state.value = 'ok'; done() }
    img.onerror = () => { state.value = 'error'; done() }
  })
}

onBeforeUnmount(() => {
  cancelTask?.()
})
```

这个方案非常适合“卡片 + icon”密集场景。

## 6. 复盘

这个项目最有价值的不是“做了一个书签页”，而是把真实工程中最常见的三类问题都走了一遍：

- 业务闭环；
- 性能瓶颈；
- 工程治理。

如果你也在做中大型前端页面，这个思路可以直接迁移：  
先保证请求终态和渲染时序稳定，再通过并发控制、视区渲染、动画降载去压性能峰值。
