import { type ActionFunctionArgs } from '@remix-run/node'
import { stripe, STRIPE_WEBHOOK_SECRET, getPlanFromPriceId } from '#app/utils/stripe.server.ts'
import { prisma } from '#app/utils/db.server.ts'
import type { SubscriptionPlan, SubscriptionStatus } from '../../utils/subscription.server.ts'

export async function action({ request }: ActionFunctionArgs) {
	if (!stripe) {
		return new Response('Stripe not configured', { status: 503 })
	}

	const payload = await request.text()
	const sig = request.headers.get('stripe-signature')

	if (!sig || !STRIPE_WEBHOOK_SECRET) {
		return new Response('Missing signature', { status: 400 })
	}

	let event
	try {
		event = stripe.webhooks.constructEvent(payload, sig, STRIPE_WEBHOOK_SECRET)
	} catch (err) {
		console.error('Webhook signature verification failed:', err)
		return new Response('Invalid signature', { status: 400 })
	}

	switch (event.type) {
		case 'checkout.session.completed': {
			const session = event.data.object
			const userId = session.metadata?.userId
			const customerId =
				typeof session.customer === 'string' ? session.customer : null
			const subscriptionId =
				typeof session.subscription === 'string'
					? session.subscription
					: null

			if (!userId || !subscriptionId) break

			// Fetch the subscription to get the plan from the price
			const stripeSubscription =
				await stripe.subscriptions.retrieve(subscriptionId)
			const priceId = stripeSubscription.items.data[0]?.price.id
			const plan = priceId ? getPlanFromPriceId(priceId) : null

			if (!plan) break

			await prisma.subscription.upsert({
				where: { userId },
				create: {
					userId,
					plan,
					status: 'active',
					provider: 'stripe',
					providerCustomerId: customerId,
					providerSubscriptionId: subscriptionId,
					currentPeriodStart: new Date(
						stripeSubscription.current_period_start * 1000,
					),
					currentPeriodEnd: new Date(
						stripeSubscription.current_period_end * 1000,
					),
				},
				update: {
					plan,
					status: 'active',
					providerCustomerId: customerId,
					providerSubscriptionId: subscriptionId,
					currentPeriodStart: new Date(
						stripeSubscription.current_period_start * 1000,
					),
					currentPeriodEnd: new Date(
						stripeSubscription.current_period_end * 1000,
					),
					cancelAtPeriodEnd: false,
				},
			})
			break
		}

		case 'customer.subscription.updated': {
			const subscription = event.data.object
			const subscriptionId = subscription.id
			const existing = await prisma.subscription.findFirst({
				where: { providerSubscriptionId: subscriptionId },
				select: { userId: true },
			})
			if (!existing) break

			const priceId = subscription.items.data[0]?.price.id
			const plan = priceId ? getPlanFromPriceId(priceId) : null

			let status: SubscriptionStatus = 'active'
			if (subscription.status === 'past_due') status = 'past_due'
			if (subscription.status === 'canceled') status = 'canceled'
			if (subscription.status === 'trialing') status = 'trialing'

			await prisma.subscription.update({
				where: { userId: existing.userId },
				data: {
					...(plan ? { plan } : {}),
					status,
					currentPeriodStart: new Date(
						subscription.current_period_start * 1000,
					),
					currentPeriodEnd: new Date(
						subscription.current_period_end * 1000,
					),
					cancelAtPeriodEnd: subscription.cancel_at_period_end,
				},
			})
			break
		}

		case 'customer.subscription.deleted': {
			const subscription = event.data.object
			const existing = await prisma.subscription.findFirst({
				where: { providerSubscriptionId: subscription.id },
				select: { userId: true },
			})
			if (!existing) break

			await prisma.subscription.update({
				where: { userId: existing.userId },
				data: {
					status: 'expired',
					cancelAtPeriodEnd: false,
				},
			})
			break
		}

		case 'invoice.payment_failed': {
			const invoice = event.data.object
			const customerId =
				typeof invoice.customer === 'string' ? invoice.customer : null
			if (!customerId) break

			const existing = await prisma.subscription.findFirst({
				where: { providerCustomerId: customerId },
				select: { userId: true },
			})
			if (!existing) break

			await prisma.subscription.update({
				where: { userId: existing.userId },
				data: { status: 'past_due' },
			})
			break
		}
	}

	return new Response('OK', { status: 200 })
}
