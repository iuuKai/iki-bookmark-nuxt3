# 从“图片全量并发”到“可控并发”：`useImageLoadQueue` 在 Nuxt3/Vue3 项目中的实践

## 1. 背景与问题
书签导航场景里，首屏和滚动区域会同时出现大量网站图标。  
如果每个卡片一上来都 `new Image()` 并立即加载，就会出现：

- 瞬时并发请求过高（主线程和网络都被挤占）
- 图标还在 loading 时，菜单动画和交互掉帧
- 某些域名图标失败率高，错误重试造成额外抖动

你的项目里引入了 `useImageLoadQueue`，核心目标就是：**限制图片加载并发，把不可控的抢资源变成可控调度**。

---

## 2. `useImageLoadQueue` 是干嘛的？

代码位置：`composables/useImageLoadQueue.ts`

核心思路：

- 维护一个全局队列 `queue`
- 维护当前活跃任务数 `activeCount`
- 设定最大并发 `MAX_CONCURRENT = 10`
- 新任务进来时：
  - 若未达并发上限，立即执行
  - 否则进入队列等待
- 每个任务必须在完成时调用 `done()`，触发下一个任务
- 返回取消函数，组件销毁前可撤销“还没开始”的任务

这其实是一个前端版的“信号量/并发池”。

---

## 3. 它在 `image.vue` 里的作用

代码位置：`components/basic/image.vue`

`image.vue` 中的关键链路是：

1. 组件进入视口（`IntersectionObserver`）后才允许加载  
2. 通过 `queue.enqueue((done) => { ... })` 把真正的 `new Image()` 放进并发池  
3. `load/error` 后调用 `done()` 释放并发名额  
4. 失败时走一次代理兜底：`/api/proxy/<url>`  
5. `cleanup()` 中解除事件、回收任务、避免内存泄漏和悬空回调

这让“懒加载”不只是“晚点加载”，而是“**晚点 + 限流 + 可取消**”。

---

## 4. 反面例子：不做队列会怎样？

下面是典型“之前做法”的简化版（反例）：

```vue
<script setup lang="ts">
const props = defineProps<{ src: string }>()
const state = ref<'loading' | 'ok' | 'error'>('loading')

onMounted(() => {
  const img = new Image()
  img.src = props.src
  img.onload = () => (state.value = 'ok')
  img.onerror = () => (state.value = 'error')
})
</script>
```

问题：

- 每个组件都立即创建请求，几十/上百张图同时抢资源
- 没有统一并发控制
- 没有取消机制，组件销毁后可能还有回调
- 对失败链接缺少统一兜底策略

---

## 5. 正向方案 Demo：队列 + 懒加载 + 清理

### 5.1 并发队列 composable（简版）

```ts
// composables/useImageLoadQueueDemo.ts
const MAX = 10
const queue: Array<() => void> = []
let active = 0

function runNext() {
  while (active < MAX && queue.length) {
    const task = queue.shift()
    if (!task) break
    active++
    task()
  }
}

export function useImageLoadQueueDemo() {
  const enqueue = (task: (done: () => void) => void) => {
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

    // 取消尚未开始的任务
    return () => {
      if (started) return
      const idx = queue.indexOf(start)
      if (idx > -1) queue.splice(idx, 1)
    }
  }

  return { enqueue }
}
```

### 5.2 图片组件（简版）

```vue
<template>
  <div ref="host">
    <div v-if="state === 'idle' || state === 'loading'">loading...</div>
    <img v-else-if="state === 'ok'" :src="url" />
    <div v-else>加载失败</div>
  </div>
</template>

<script setup lang="ts">
import { useImageLoadQueueDemo } from '@/composables/useImageLoadQueueDemo'

const props = defineProps<{ src: string; lazy?: boolean }>()
const host = ref<HTMLElement | null>(null)
const state = ref<'idle' | 'loading' | 'ok' | 'error'>('idle')
const url = ref('')
const queue = useImageLoadQueueDemo()

let cancelQueued: null | (() => void) = null
let releaseSlot: null | (() => void) = null
let img: HTMLImageElement | null = null

function startLoad() {
  if (state.value !== 'idle') return
  state.value = 'loading'
  cancelQueued = queue.enqueue((done) => {
    cancelQueued = null
    releaseSlot = done
    img = new Image()
    img.src = props.src
    img.onload = () => {
      url.value = img!.src
      state.value = 'ok'
      releaseSlot?.()
      releaseSlot = null
    }
    img.onerror = () => {
      state.value = 'error'
      releaseSlot?.()
      releaseSlot = null
    }
  })
}

onMounted(() => {
  if (!props.lazy) return startLoad()
  if (!host.value) return
  const io = new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting) startLoad()
  })
  io.observe(host.value)
  onBeforeUnmount(() => io.disconnect())
})

onBeforeUnmount(() => {
  cancelQueued?.()
  cancelQueued = null
  releaseSlot?.()
  releaseSlot = null
  if (img) {
    img.src = ''
    img = null
  }
})
</script>
```

---

## 6. 其他可选方案（含 demo）

## 方案 A：只用浏览器原生 `loading="lazy"`

```vue
<img :src="src" loading="lazy" decoding="async" />
```

优点：

- 最简单，几乎零维护
- 浏览器层优化普适

缺点：

- 只能“延迟加载”，不能精确限制并发数
- 不方便统一做取消、失败兜底、优先级控制

适用：

- 图片数量中等、交互压力不高的页面

## 方案 B：批次调度（分片启动）而非严格并发池

```ts
// 每 100ms 启动一批，每批 6 张
const BATCH_SIZE = 6
const INTERVAL = 100
const tasks: Array<() => void> = []

setInterval(() => {
  const batch = tasks.splice(0, BATCH_SIZE)
  batch.forEach(run => run())
}, INTERVAL)
```

优点：

- 实现简单，能明显缓解瞬时尖峰
- 对“首屏爆量加载”有直接效果

缺点：

- 不是严格并发控制（慢请求可能堆积）
- 调参依赖场景，稳定性不如并发池

适用：

- 过渡方案、快速止血

## 方案 C：列表虚拟化（减少同时在 DOM 中的图片）

```vue
<!-- 伪代码：仅渲染可视区卡片 -->
<VirtualList :items="list" :item-height="72">
  <template #default="{ item }">
    <BookmarkCard :data="item" />
  </template>
</VirtualList>
```

优点：

- 从根上减少渲染节点，主线程压力下降明显
- 对超长列表最有效

缺点：

- 实现复杂度更高
- 滚动定位、动态高度、动画等要额外处理

适用：

- 千级以上长列表

---

## 7. 方案对比结论

- 你当前的 `useImageLoadQueue + image.vue` 实现，是“复杂度与收益”比较平衡的工程化方案。  
- 如果页面继续增长，可以在此基础上叠加“虚拟列表”进一步降压。  
- 仅靠 `loading="lazy"` 通常不够，因为它解决的是“是否立即加载”，不是“全局并发调度”。

---

## 8. 这部分涉及到的核心知识点

- 浏览器资源加载模型（网络并发、主线程竞争）
- `IntersectionObserver` 懒加载
- 并发控制（信号量 / 任务队列）
- 生命周期清理（防泄漏、防重复回调）
- 错误兜底与降级（代理重试）
- UX 状态设计（占位、成功、失败三态）

---

## 9. 可落地优化建议（基于你当前项目）

- 把 `MAX_CONCURRENT` 做成可配置（按设备/网络动态调整）
- 对“首屏上方图标”加入优先级队列（先保证首屏观感）
- 失败 URL 做短期缓存（避免同一轮次重复失败重试）
- 在慢网场景启用更轻量 placeholder，减少动画开销

这篇可以直接作为你技术分享的主稿：从问题、反例、方案、替代、取舍到落地建议，闭环完整。

---

## 10. 可运行直观对比 Demo（已落地到项目）

已新增页面：`/demo/image-queue`  
源码：`pages/demo/image-queue.vue`

### 怎么跑

1. 启动项目：`npm run dev`
2. 打开：`http://localhost:3000/demo/image-queue`
3. 点“开始对比”

### 你会看到什么

- 左侧（反例）：“不做队列”会快速把 `active` 冲高，`peak` 明显大
- 右侧（正例）：`useImageLoadQueue` 会把并发压在上限附近，曲线更平稳
- 两侧都是同一批 URL，能直观看到调度策略差异

### 建议观察指标

- `peak`：峰值并发是否被有效限制  
- `duration`：总耗时是否可接受  
- `active` 波动：是否平稳（避免瞬时抢资源）  
- 页面交互流畅度：菜单 hover、滚动是否掉帧

### 可调参数

- `count`：一次加载的图片数量（20~240）
- `useImageLoadQueue.ts` 里的 `MAX_CONCURRENT`

建议先用 `count=80` 看一轮，再改 `MAX_CONCURRENT` 为 `4 / 10 / 16` 分别观察峰值与耗时的权衡。


> 这个书签项目里我做过一轮图片加载性能治理。场景是列表里有大量网站 icon，早期做法是每个卡片各自 new Image()，虽然做了懒加载，但进入视口后仍然会瞬时并发很多请求，导致主线程和网络都被挤占，表现就是滚动和侧边栏动画卡顿。后来我抽了一个 useImageLoadQueue，本质是前端并发池：统一维护队列和 activeCount，设置 MAX_CONCURRENT=10，每个图片任务结束必须 done() 释放名额，组件卸载还能取消未启动任务。这样把不可控并发改成可控调度。配合 IntersectionObserver、失败代理兜底和 cleanup，最终把峰值并发压住，交互稳定性明显提升。我还做了一个对比 demo，同批图片下能直观看到无队列和限并发的 peak/duration 差异，这套方案后来也能复用到文件预览和封面图场景。