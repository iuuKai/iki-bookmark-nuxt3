type QueueTask = () => void

const MAX_CONCURRENT = 10
const queue: QueueTask[] = []
let activeCount = 0

const runNext = () => {
	while (activeCount < MAX_CONCURRENT && queue.length) {
		const task = queue.shift()
		if (!task) break
		activeCount++
		task()
	}
}

export const useImageLoadQueue = () => {
	const enqueue = (task: (done: () => void) => void) => {
		let started = false
		let doneCalled = false

		const done = () => {
			if (doneCalled) return
			doneCalled = true
			activeCount = Math.max(activeCount - 1, 0)
			runNext()
		}

		const start = () => {
			started = true
			task(done)
		}

		if (activeCount < MAX_CONCURRENT) {
			activeCount++
			start()
		} else {
			queue.push(start)
		}

		return () => {
			if (started) return
			const index = queue.indexOf(start)
			if (index > -1) queue.splice(index, 1)
		}
	}

	return { enqueue }
}
