/**
 * Color palette ported from the web app's extended-theme.ts.
 * Used for programmatic access (charts, status bars, etc.)
 * where Tailwind classes aren't available.
 */
export const colors = {
	background: '#0a1628',
	foreground: '#f8fafc',
	primary: '#f8fafc',
	primaryForeground: '#1e293b',
	muted: '#1e293b',
	mutedForeground: '#94a3b8',
	accent: '#172033',
	accentForeground: '#f8fafc',
	destructive: '#7f1d1d',
	destructiveForeground: '#f8fafc',
	card: '#0a1628',
	cardForeground: '#f8fafc',
	border: '#1e293b',
	ring: '#cbd5e1',

	// Semantic status colors
	positiveGreen: '#7ae582',
	neutralYellow: '#e5e07a',
	negativeRed: '#e57a7a',
	negativeOrange: '#e5a87a',

	// Chart parameter colors
	chart: {
		pH: '#60A5FA',
		alk: '#34D399',
		calcium: '#A78BFA',
		magnesium: '#FBBF24',
		nitrate: '#EC4899',
		phosphate: '#6366F1',
		temp: '#F87171',
		salinity: '#F87171',
	},
} as const

/**
 * Health score color based on 1-10 scale.
 */
export function getHealthColor(score: number): string {
	if (score >= 8) return colors.positiveGreen
	if (score >= 6) return colors.neutralYellow
	return colors.negativeRed
}
