import { prisma } from '../../app/utils/db.server.ts'

export type SubscriptionPlan = 'free' | 'pro' | 'premium'
export type SubscriptionStatus =
	| 'active'
	| 'canceled'
	| 'past_due'
	| 'trialing'
	| 'expired'
export type SubscriptionProvider = 'stripe' | 'apple' | 'google'

export const PLAN_DETAILS = {
	free: {
		name: 'Free',
		tanks: 2,
		parameterLogsPerMonth: 30,
		coralAnalysesPerMonth: 3,
		galleryImagesPerTank: 10,
	},
	pro: {
		name: 'Pro',
		tanks: 10,
		parameterLogsPerMonth: -1, // unlimited
		coralAnalysesPerMonth: 25,
		galleryImagesPerTank: 100,
	},
	premium: {
		name: 'Premium',
		tanks: -1, // unlimited
		parameterLogsPerMonth: -1,
		coralAnalysesPerMonth: -1,
		galleryImagesPerTank: -1,
	},
} as const satisfies Record<SubscriptionPlan, unknown>

/** Stripe price IDs — set via environment variables */
export const STRIPE_PRICES = {
	pro_monthly: process.env.STRIPE_PRICE_PRO_MONTHLY ?? '',
	pro_yearly: process.env.STRIPE_PRICE_PRO_YEARLY ?? '',
	premium_monthly: process.env.STRIPE_PRICE_PREMIUM_MONTHLY ?? '',
	premium_yearly: process.env.STRIPE_PRICE_PREMIUM_YEARLY ?? '',
}

export async function getUserSubscription(userId: string) {
	const subscription = await prisma.subscription.findUnique({
		where: { userId },
		select: {
			id: true,
			plan: true,
			status: true,
			provider: true,
			currentPeriodStart: true,
			currentPeriodEnd: true,
			cancelAtPeriodEnd: true,
			createdAt: true,
		},
	})

	if (!subscription) {
		return {
			plan: 'free' as SubscriptionPlan,
			status: 'active' as SubscriptionStatus,
			provider: null,
			currentPeriodStart: null,
			currentPeriodEnd: null,
			cancelAtPeriodEnd: false,
		}
	}

	return subscription
}

export async function getUserPlan(userId: string): Promise<SubscriptionPlan> {
	const sub = await prisma.subscription.findUnique({
		where: { userId },
		select: { plan: true, status: true, currentPeriodEnd: true },
	})

	if (!sub) return 'free'

	// If expired or canceled without active period, treat as free
	if (sub.status === 'expired') return 'free'
	if (
		sub.status === 'canceled' &&
		sub.currentPeriodEnd &&
		sub.currentPeriodEnd < new Date()
	) {
		return 'free'
	}

	return sub.plan as SubscriptionPlan
}

export async function upsertSubscription(
	userId: string,
	data: {
		plan: SubscriptionPlan
		status: SubscriptionStatus
		provider: SubscriptionProvider
		providerCustomerId?: string
		providerSubscriptionId?: string
		currentPeriodStart?: Date
		currentPeriodEnd?: Date
		cancelAtPeriodEnd?: boolean
	},
) {
	return prisma.subscription.upsert({
		where: { userId },
		create: { userId, ...data },
		update: data,
	})
}

export async function cancelSubscription(userId: string) {
	const sub = await prisma.subscription.findUnique({
		where: { userId },
		select: { id: true },
	})
	if (!sub) return null

	return prisma.subscription.update({
		where: { userId },
		data: {
			cancelAtPeriodEnd: true,
			status: 'canceled',
		},
	})
}

export async function findSubscriptionByProviderCustomerId(
	providerCustomerId: string,
) {
	return prisma.subscription.findFirst({
		where: { providerCustomerId },
		select: {
			id: true,
			userId: true,
			plan: true,
			status: true,
			provider: true,
		},
	})
}

export async function findSubscriptionByProviderSubscriptionId(
	providerSubscriptionId: string,
) {
	return prisma.subscription.findFirst({
		where: { providerSubscriptionId },
		select: {
			id: true,
			userId: true,
			plan: true,
			status: true,
			provider: true,
		},
	})
}
