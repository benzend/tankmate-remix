import { Router } from 'express'
import { authenticateAPI, getUserId } from './middleware.ts'
import {
	getUserSubscription,
	getUserPlan,
	upsertSubscription,
	cancelSubscription,
	PLAN_DETAILS,
	STRIPE_PRICES,
	type SubscriptionPlan,
	type SubscriptionProvider,
} from '../services/subscription.service.ts'

const router = Router()

// All routes require authentication
router.use(authenticateAPI)

/**
 * GET /api/v1/subscription
 * Get the current user's subscription info
 */
router.get('/', async (req, res) => {
	try {
		const userId = getUserId(req)
		const subscription = await getUserSubscription(userId)
		return res.json({ subscription })
	} catch (error) {
		console.error('Error fetching subscription:', error)
		return res.status(500).json({ error: 'Failed to fetch subscription' })
	}
})

/**
 * GET /api/v1/subscription/plans
 * List available plans with feature details
 */
router.get('/plans', async (_req, res) => {
	const plans = Object.entries(PLAN_DETAILS).map(([key, details]) => ({
		id: key,
		...details,
		prices:
			key === 'free'
				? null
				: {
						monthly: key === 'pro' ? 4.99 : 9.99,
						yearly: key === 'pro' ? 49.99 : 99.99,
					},
	}))
	return res.json({ plans })
})

/**
 * POST /api/v1/subscription/validate-receipt
 * Validate a mobile IAP receipt (Apple/Google via RevenueCat)
 * Called by mobile after a successful purchase to sync the subscription
 */
router.post('/validate-receipt', async (req, res) => {
	try {
		const userId = getUserId(req)
		const { plan, provider, revenueCatUserId, entitlementId, expiresDate } =
			req.body as {
				plan: SubscriptionPlan
				provider: SubscriptionProvider
				revenueCatUserId: string
				entitlementId: string
				expiresDate: string
			}

		if (!plan || !provider || !revenueCatUserId) {
			return res.status(400).json({ error: 'Missing required fields' })
		}

		if (!['apple', 'google'].includes(provider)) {
			return res.status(400).json({ error: 'Invalid provider for mobile' })
		}

		if (!['pro', 'premium'].includes(plan)) {
			return res.status(400).json({ error: 'Invalid plan' })
		}

		const subscription = await upsertSubscription(userId, {
			plan,
			status: 'active',
			provider,
			providerCustomerId: revenueCatUserId,
			providerSubscriptionId: entitlementId,
			currentPeriodStart: new Date(),
			currentPeriodEnd: expiresDate ? new Date(expiresDate) : undefined,
		})

		return res.json({ subscription })
	} catch (error) {
		console.error('Error validating receipt:', error)
		return res.status(500).json({ error: 'Failed to validate receipt' })
	}
})

/**
 * POST /api/v1/subscription/cancel
 * Cancel the current subscription (marks cancelAtPeriodEnd)
 */
router.post('/cancel', async (req, res) => {
	try {
		const userId = getUserId(req)
		const result = await cancelSubscription(userId)

		if (!result) {
			return res.status(404).json({ error: 'No active subscription found' })
		}

		return res.json({ subscription: result })
	} catch (error) {
		console.error('Error canceling subscription:', error)
		return res.status(500).json({ error: 'Failed to cancel subscription' })
	}
})

/**
 * POST /api/v1/subscription/restore
 * Restore subscription from RevenueCat (mobile — after reinstall or device change)
 */
router.post('/restore', async (req, res) => {
	try {
		const userId = getUserId(req)
		const { plan, provider, revenueCatUserId, entitlementId, expiresDate } =
			req.body as {
				plan: SubscriptionPlan
				provider: SubscriptionProvider
				revenueCatUserId: string
				entitlementId: string
				expiresDate: string
			}

		if (!plan || !provider || !revenueCatUserId) {
			return res.status(400).json({ error: 'Missing required fields' })
		}

		const subscription = await upsertSubscription(userId, {
			plan,
			status: 'active',
			provider,
			providerCustomerId: revenueCatUserId,
			providerSubscriptionId: entitlementId,
			currentPeriodStart: new Date(),
			currentPeriodEnd: expiresDate ? new Date(expiresDate) : undefined,
		})

		return res.json({ subscription })
	} catch (error) {
		console.error('Error restoring subscription:', error)
		return res.status(500).json({ error: 'Failed to restore subscription' })
	}
})

export default router
