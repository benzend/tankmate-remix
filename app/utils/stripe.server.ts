import Stripe from 'stripe'

if (!process.env.STRIPE_SECRET_KEY) {
	console.warn('STRIPE_SECRET_KEY not set — Stripe features will be disabled')
}

export const stripe = process.env.STRIPE_SECRET_KEY
	? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2025-02-24.acacia' })
	: null

export const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET ?? ''

/** Map Stripe price IDs → plan names */
export function getPlanFromPriceId(priceId: string): 'pro' | 'premium' | null {
	const proPrices = [
		process.env.STRIPE_PRICE_PRO_MONTHLY,
		process.env.STRIPE_PRICE_PRO_YEARLY,
	].filter(Boolean)
	const premiumPrices = [
		process.env.STRIPE_PRICE_PREMIUM_MONTHLY,
		process.env.STRIPE_PRICE_PREMIUM_YEARLY,
	].filter(Boolean)

	if (proPrices.includes(priceId)) return 'pro'
	if (premiumPrices.includes(priceId)) return 'premium'
	return null
}
