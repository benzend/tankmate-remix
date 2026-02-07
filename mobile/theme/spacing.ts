/**
 * Common spacing and layout constants.
 */
export const spacing = {
	xs: 4,
	sm: 8,
	md: 16,
	lg: 24,
	xl: 32,
	'2xl': 48,
} as const

export const borderRadius = {
	sm: 4,
	md: 6,
	lg: 8,
	xl: 12,
	full: 9999,
} as const

/** Minimum touch target per Apple/Google HIG */
export const MIN_TOUCH_TARGET = 44
