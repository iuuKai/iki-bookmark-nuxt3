export const useWebsiteIcon = (pageUrl?: string, savedIcon?: string) => {
	const icon = (savedIcon ?? '').trim()
	if (icon) return normalizeIconUrl(icon)

	const fallback = buildFaviconUrl(pageUrl)
	return fallback || ''
}

const normalizeIconUrl = (value: string) => {
	if (!value) return ''
	if (/^\/\//.test(value)) return `https:${value}`
	return value
}

const buildFaviconUrl = (pageUrl?: string) => {
	if (!pageUrl) return ''
	try {
		const { origin } = new URL(pageUrl)
		return `${origin}/favicon.ico`
	} catch {
		return ''
	}
}
