/**
 * Typography scale matching the web app's Jost + Gowun Batang fonts.
 * Sizes are in pixels (React Native uses dp which maps ~1:1 on most devices).
 */
export const fonts = {
	sans: 'Jost',
	serif: 'GowunBatang',
} as const

export const fontSizes = {
	'2xs': 12,
	xs: 14,
	sm: 16,
	md: 20,
	lg: 24,
	xl: 28,
	'2xl': 32,
	h6: 16,
	h5: 24,
	h4: 28,
	h3: 32,
	h2: 40,
	h1: 56,
} as const

export const fontWeights = {
	normal: '400' as const,
	medium: '500' as const,
	semibold: '600' as const,
	bold: '700' as const,
}
