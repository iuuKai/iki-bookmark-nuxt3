let handledInitialNavigation = false

export default defineNuxtRouteMiddleware(to => {
	if (process.server) return
	if (handledInitialNavigation) return
	handledInitialNavigation = true

	const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
	const navType = navigation?.type ?? 'navigate'
	const isHardEntry = navType === 'reload' || navType === 'navigate'
	const shouldKeepPath = to.path === '/' || to.path === '/oauth' || to.path.startsWith('/demo')
	if (isHardEntry && !shouldKeepPath) {
		return navigateTo('/', { replace: true })
	}
})
