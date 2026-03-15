import { prisma } from './db.server.ts'
import { stripe } from './stripe.server.ts'
import {
	type SubscriptionPlan,
	type SubscriptionStatus,
	PLAN_DETAILS,
} from '../../server/services/subscription.service.ts'

export { PLAN_DETAILS, type SubscriptionPlan, type SubscriptionStatus }

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
		},
	})

	if (!subscription) {
		return {
			plan: 'free' as SubscriptionPlan,
			status: 'active' as const,
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

export async function createStripeCheckoutSession({
	userId,
	email,
	priceId,
	successUrl,
	cancelUrl,
}: {
	userId: string
	email: string
	priceId: string
	successUrl: string
	cancelUrl: string
}) {
	if (!stripe) throw new Error('Stripe is not configured')

	// Check if user already has a Stripe customer ID
	const existing = await prisma.subscription.findUnique({
		where: { userId },
		select: { providerCustomerId: true },
	})

	const sessionParams: Record<string, unknown> = {
		mode: 'subscription',
		payment_method_types: ['card'],
		line_items: [{ price: priceId, quantity: 1 }],
		success_url: successUrl,
		cancel_url: cancelUrl,
		metadata: { userId },
	}

	if (existing?.providerCustomerId) {
		sessionParams.customer = existing.providerCustomerId
	} else {
		sessionParams.customer_email = email
	}

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const session = await stripe.checkout.sessions.create(sessionParams as any)
	return session
}

export async function createStripeBillingPortalSession({
	userId,
	returnUrl,
}: {
	userId: string
	returnUrl: string
}) {
	if (!stripe) throw new Error('Stripe is not configured')

	const sub = await prisma.subscription.findUnique({
		where: { userId },
		select: { providerCustomerId: true },
	})

	if (!sub?.providerCustomerId) {
		throw new Error('No Stripe customer found')
	}

	const session = await stripe.billingPortal.sessions.create({
		customer: sub.providerCustomerId,
		return_url: returnUrl,
	})

	return session
}
