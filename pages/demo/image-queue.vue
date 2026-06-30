<template>
	<div class="bm-demo">
		<div class="bm-demo_header">
			<el-text tag="h2" size="large">Image Queue 对比 Demo</el-text>
			<el-text type="info">
				同批图片：左侧无队列并发，右侧 useImageLoadQueue 限并发（MAX_CONCURRENT=10）
			</el-text>
			<div class="bm-demo_actions">
				<el-input-number v-model="count" :min="20" :max="240" :step="20" />
				<el-button type="primary" :loading="running" @click="runCompare">开始对比</el-button>
				<el-button @click="resetAll">重置</el-button>
			</div>
		</div>

		<div class="bm-demo_grid">
			<section class="bm-demo_panel">
				<div class="bm-demo_panel_head">
					<el-text tag="h3">反例：不做队列</el-text>
					<el-tag type="danger">all-at-once</el-tag>
				</div>
				<div class="bm-demo_metrics">
					<span>active: {{ naive.metrics.active }}</span>
					<span>peak: {{ naive.metrics.peak }}</span>
					<span>loaded: {{ naive.metrics.loaded }}</span>
					<span>failed: {{ naive.metrics.failed }}</span>
					<span>ms: {{ naive.metrics.duration }}</span>
				</div>
				<div class="bm-demo_list">
					<div
						v-for="item in naive.items"
						:key="`n-${item.id}`"
						:class="['bm-demo_item', `is-${item.status}`]"
					>
						<img v-if="item.status === 'loaded'" :src="item.url" alt="" loading="lazy" decoding="async" />
					</div>
				</div>
			</section>

			<section class="bm-demo_panel">
				<div class="bm-demo_panel_head">
					<el-text tag="h3">正例：useImageLoadQueue</el-text>
					<el-tag type="success">queued</el-tag>
				</div>
				<div class="bm-demo_metrics">
					<span>active: {{ queued.metrics.active }}</span>
					<span>peak: {{ queued.metrics.peak }}</span>
					<span>loaded: {{ queued.metrics.loaded }}</span>
					<span>failed: {{ queued.metrics.failed }}</span>
					<span>ms: {{ queued.metrics.duration }}</span>
				</div>
				<div class="bm-demo_list">
					<div
						v-for="item in queued.items"
						:key="`q-${item.id}`"
						:class="['bm-demo_item', `is-${item.status}`]"
					>
						<img v-if="item.status === 'loaded'" :src="item.url" alt="" loading="lazy" decoding="async" />
					</div>
				</div>
			</section>
		</div>
	</div>
</template>

<script setup lang="ts">
import { useImageLoadQueue } from '@/composables/useImageLoadQueue'

type LoadStatus = 'idle' | 'loading' | 'loaded' | 'error'
type Mode = 'naive' | 'queued'

interface DemoItem {
	id: number
	url: string
	status: LoadStatus
}

interface Metrics {
	active: number
	peak: number
	loaded: number
	failed: number
	duration: number
}

interface RuntimeRecord {
	cancel: (() => void) | null
	cleanup: (() => void) | null
}

definePageMeta({
	layout: 'default'
})

const queue = useImageLoadQueue()
const count = ref(80)
const running = ref(false)
const runToken = ref(0)

const naive = reactive({
	items: [] as DemoItem[],
	metrics: createMetrics()
})

const queued = reactive({
	items: [] as DemoItem[],
	metrics: createMetrics()
})

const runtimes = reactive({
	naive: [] as RuntimeRecord[],
	queued: [] as RuntimeRecord[]
})

function createMetrics(): Metrics {
	return { active: 0, peak: 0, loaded: 0, failed: 0, duration: 0 }
}

function makeUrls(total: number): string[] {
	return Array.from({ length: total }, (_, i) => `https://picsum.photos/seed/iki-${i + 1}/48/48`)
}

function resetMetrics(metrics: Metrics) {
	metrics.active = 0
	metrics.peak = 0
	metrics.loaded = 0
	metrics.failed = 0
	metrics.duration = 0
}

function cleanupMode(mode: Mode) {
	for (const rt of runtimes[mode]) {
		rt.cancel?.()
		rt.cleanup?.()
	}
	runtimes[mode] = []
}

function resetAll() {
	runToken.value++
	running.value = false
	cleanupMode('naive')
	cleanupMode('queued')
	naive.items = []
	queued.items = []
	resetMetrics(naive.metrics)
	resetMetrics(queued.metrics)
}

function beginTask(metrics: Metrics) {
	metrics.active += 1
	if (metrics.active > metrics.peak) metrics.peak = metrics.active
}

function endTask(metrics: Metrics, isOk: boolean) {
	metrics.active = Math.max(0, metrics.active - 1)
	if (isOk) metrics.loaded += 1
	else metrics.failed += 1
}

function createLoadTask(
	mode: Mode,
	url: string,
	item: DemoItem,
	done?: () => void
): { cleanup: () => void } {
	const metrics = mode === 'naive' ? naive.metrics : queued.metrics
	const img = new Image()
	let settled = false

	beginTask(metrics)
	item.status = 'loading'

	const finalize = (isOk: boolean) => {
		if (settled) return
		settled = true
		item.status = isOk ? 'loaded' : 'error'
		endTask(metrics, isOk)
		done?.()
	}

	const onLoad = () => finalize(true)
	const onError = () => finalize(false)

	img.decoding = 'async'
	img.referrerPolicy = 'no-referrer'
	img.addEventListener('load', onLoad, false)
	img.addEventListener('error', onError, false)
	img.src = url

	return {
		cleanup: () => {
			if (settled) return
			img.removeEventListener('load', onLoad, false)
			img.removeEventListener('error', onError, false)
			img.src = ''
			finalize(false)
		}
	}
}

async function runMode(mode: Mode, urls: string[], tokenAtStart: number) {
	const panel = mode === 'naive' ? naive : queued
	cleanupMode(mode)
	resetMetrics(panel.metrics)
	panel.items = urls.map((url, i) => ({ id: i + 1, url, status: 'idle' }))

	const begin = performance.now()
	const tasks = panel.items.map((item: DemoItem) => {
		return new Promise<void>(resolve => {
			const start = () => {
				if (runToken.value !== tokenAtStart) return resolve()
				const { cleanup } = createLoadTask(mode, item.url, item, resolve)
				runtimes[mode].push({ cancel: null, cleanup })
			}

			if (mode === 'queued') {
				const cancel = queue.enqueue((done: () => void) => {
					if (runToken.value !== tokenAtStart) {
						done()
						return resolve()
					}
					const { cleanup } = createLoadTask(mode, item.url, item, () => {
						done()
						resolve()
					})
					runtimes[mode].push({ cancel: null, cleanup })
				})
				runtimes[mode].push({ cancel, cleanup: null })
				return
			}

			start()
		})
	})

	await Promise.all(tasks)
	if (runToken.value !== tokenAtStart) return
	panel.metrics.duration = Math.round(performance.now() - begin)
}

async function runCompare() {
	const tokenAtStart = Date.now()
	runToken.value = tokenAtStart
	running.value = true
	const urls = makeUrls(count.value)
	await Promise.all([runMode('naive', urls, tokenAtStart), runMode('queued', urls, tokenAtStart)])
	if (runToken.value === tokenAtStart) running.value = false
}

onBeforeUnmount(() => {
	resetAll()
})
</script>

<style scoped lang="less">
.bm-demo {
	@apply py-4;

	&_header {
		@apply flex flex-col gap-3;
	}

	&_actions {
		@apply flex items-center gap-2;
	}

	&_grid {
		@apply mt-4 grid grid-cols-1 lg:grid-cols-2 gap-4;
	}

	&_panel {
		@apply p-3 rounded-lg bg-white/70 shadow-md;
	}

	&_panel_head {
		@apply flex items-center justify-between;
	}

	&_metrics {
		@apply mt-2 grid grid-cols-3 gap-2 text-xs text-gray-700;
	}

	&_list {
		@apply mt-3 grid grid-cols-8 sm:grid-cols-10 md:grid-cols-12 gap-1;
	}

	&_item {
		@apply w-6 h-6 rounded overflow-hidden border border-black/5;

		img {
			@apply w-full h-full object-cover;
		}

		&.is-idle {
			@apply bg-gray-200/60;
		}

		&.is-loading {
			@apply bg-blue-200/80;
		}

		&.is-loaded {
			@apply bg-emerald-200/60;
		}

		&.is-error {
			@apply bg-red-300/70;
		}
	}
}
</style>
