# 前端并发池/队列 2 周训练营（每天 1 小时）

目标：让你从“会用 `useImageLoadQueue`”升级到“能独立设计并发调度方案并在项目里落地”。

适用项目：`iki-bookmark-nuxt3`  
建议节奏：每天 60 分钟（20 分钟学习 + 30 分钟实操 + 10 分钟复盘）

---

## 学习产出标准（每天都要有）

- 一段当天的知识总结（3-5 句话）
- 一个可运行的代码改动或 demo
- 一个可量化结果（峰值并发/耗时/交互流畅度等）

---

## 第 1 周：把核心模型吃透（从会用到会解释）

### Day 1：事件循环与异步调度心智模型
- 学习：
  - https://javascript.info/event-loop
  - https://jakearchibald.com/2015/tasks-microtasks-queues-and-schedules/index.html
- 实操：
  - 在本地写一个 `setTimeout + Promise` 执行顺序 demo，注释每一步为什么。
- 验收：
  - 能口述“宏任务/微任务差异 + 为什么这会影响 UI 卡顿”。

### Day 2：图片加载链路与浏览器行为
- 学习：
  - https://developer.mozilla.org/en-US/docs/Web/API/HTMLImageElement/loading
  - https://developer.mozilla.org/en-US/docs/Web/API/HTMLImageElement/decode
- 实操：
  - 在你项目里找 `image.vue`，标注出 `loading="lazy"`、`decoding="async"` 的作用。
- 验收：
  - 能解释“懒加载不等于并发控制”。

### Day 3：IntersectionObserver 懒加载机制
- 学习：
  - https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API
  - https://vueuse.org/core/useintersectionobserver/
- 实操：
  - 在 demo 页做一个“进入视口才触发加载”的简化组件。
- 验收：
  - 能解释阈值、回调触发时机、为什么比 scroll 监听更高效。

### Day 4：并发池核心代码拆解
- 学习：
  - 阅读 `composables/useImageLoadQueue.ts`
- 实操：
  - 用注释逐行标注：`queue`、`activeCount`、`enqueue`、`done`、`runNext`。
- 验收：
  - 你可以不用看代码，手写出一个最小版并发池（20 行左右）。

### Day 5：反例验证（不做并发控制）
- 学习：
  - 对照你写的 `pages/demo/image-queue.vue`
- 实操：
  - 在 demo 中跑 `count=80`，记录无队列模式的 `peak/duration`。
- 验收：
  - 输出一段结论：“为什么会卡，卡在什么资源上（网络/主线程/渲染）”。

### Day 6：正例验证（队列限并发）
- 学习：
  - 继续使用 `pages/demo/image-queue.vue`
- 实操：
  - 固定 `count=80`，分别测试 `MAX_CONCURRENT=4/10/16`。
- 验收：
  - 产出一张对比表：`并发上限 -> peak -> duration -> 主观流畅度`。

### Day 7：周总结 + 面试表达
- 学习：
  - 回看 Day1-Day6 笔记
- 实操：
  - 写 1 分钟和 3 分钟两个版本的项目口述稿。
- 验收：
  - 口播录音一次，检查是否包含：问题、方案、结果、取舍。

---

## 第 2 周：从“图片队列”扩展到“通用任务队列”

### Day 8：抽象能力升级（useTaskQueue）
- 学习：
  - https://github.com/sindresorhus/p-limit
  - https://github.com/sindresorhus/p-queue
- 实操：
  - 新建 `useTaskQueue`（支持泛型任务）。
- 验收：
  - 能把图片加载迁移到 `useTaskQueue` 跑通。

### Day 9：加优先级（首屏优先）
- 学习：
  - 优先队列基本概念（高/中/低）
- 实操：
  - 给队列加 `priority` 参数：首屏图片高优先级。
- 验收：
  - demo 中观察到首屏更快稳定展示。

### Day 10：重试与失败缓存
- 学习：
  - 错误处理与退避重试基础（指数退避概念）
- 实操：
  - 加 `retry=1` + 失败短缓存（同 URL 30 秒内不重试）。
- 验收：
  - 失败率高场景下，重复抖动减少。

### Day 11：取消与内存安全
- 学习：
  - 组件卸载/任务取消语义
- 实操：
  - 检查并统一 `cleanup` 行为：未开始可取消、已开始可释放。
- 验收：
  - 快速切页时无悬空回调、无明显内存增长。

### Day 12：把队列应用到“非图片场景”
- 学习：
  - 批量 API 调度思路
- 实操：
  - 写一个“批量请求详情接口”的并发池 demo（例如并发 5）。
- 验收：
  - 能证明请求峰值被限制，且总任务最终完成。

### Day 13：性能观测与数据化表达
- 学习：
  - https://web.dev/learn/performance/
- 实操：
  - 在 demo 面板增加：平均单任务耗时、成功率、吞吐（tasks/s）。
- 验收：
  - 你能用数据而不是感觉来说明优化收益。

### Day 14：收官（博客 + 简历 + 面试）
- 学习：
  - 回看 `blog2.md`
- 实操：
  - 产出三份内容：
  - 技术博客（问题/方案/反例/替代/结论）
  - 简历项目描述（3-5 条）
  - 面试 10 问 10 答（并发池专题）
- 验收：
  - 找朋友模拟面试 20 分钟，至少答对 8 问。

---

## 每天复盘模板（复制用）

```md
### Day X 复盘
- 今天学了什么：
- 今天改了什么：
- 指标变化（peak/duration/成功率）：
- 遇到的问题：
- 明天计划：
```

---

## 你这套训练完成后，应该具备的能力

- 能解释并发池/队列与懒加载的边界
- 能独立实现“可取消、可限流、可观测”的任务调度
- 能把方案迁移到上传、批量请求、预加载等场景
- 面试中能讲清楚“为什么这样设计、收益与取舍是什么”

如果你按这个节奏执行，我可以继续做你的“每日作业批改器”：你每天贴复盘，我给你逐条点评并给下一天的加练题。
