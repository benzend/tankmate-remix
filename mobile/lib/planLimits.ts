import { type Subscription } from './api'

export const PLAN_LIMITS = {
	free: {
		tanks: 2,
		parameterLogsPerMonth: 30,
		coralAnalysesPerMonth: 3,
		galleryImagesPerTank: 10,
	},
	pro: {
		tanks: 10,
		parameterLogsPerMonth: -1,
		coralAnalysesPerMonth: 25,
		galleryImagesPerTank: 100,
	},
	premium: {
		tanks: -1,
		parameterLogsPerMonth: -1,
		coralAnalysesPerMonth: -1,
		galleryImagesPerTank: -1,
	},
} as const

export type PlanKey = keyof typeof PLAN_LIMITS

export function getEffectivePlan(subscription: Subscription | undefined): PlanKey {
	if (!subscription) return 'free'
	if (subscription.plan === 'free') return 'free'
	if (subscription.status === 'expired') return 'free'
	if (
		subscription.status === 'canceled' &&
		subscription.currentPeriodEnd &&
		new Date(subscription.currentPeriodEnd) < new Date()
	) {
		return 'free'
	}
	return subscription.plan as PlanKey
}

export function getPlanLimits(subscription: Subscription | undefined) {
	const plan = getEffectivePlan(subscription)
	return { plan, limits: PLAN_LIMITS[plan] }
}

export function isWithinLimit(limit: number, current: number): boolean {
	if (limit === -1) return true
	return current < limit
}
