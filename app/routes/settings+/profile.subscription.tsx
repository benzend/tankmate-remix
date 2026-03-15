import { type SEOHandle } from '@nasa-gcn/remix-seo'
import {
	json,
	redirect,
	type LoaderFunctionArgs,
	type ActionFunctionArgs,
} from '@remix-run/node'
import { useFetcher, useLoaderData } from '@remix-run/react'
import { z } from 'zod'
import { Button } from '#app/components/ui/button.tsx'
import { Icon } from '#app/components/ui/icon.tsx'
import { StatusButton } from '#app/components/ui/status-button.tsx'
import { requireUserId } from '#app/utils/auth.server.ts'
import { prisma } from '#app/utils/db.server.ts'
import {
	getUserSubscription,
	PLAN_DETAILS,
	createStripeCheckoutSession,
	createStripeBillingPortalSession,
} from '#app/utils/subscription.server.ts'

export const handle: SEOHandle = {
	getSitemapEntries: () => null,
}

export async function loader({ request }: LoaderFunctionArgs) {
	const userId = await requireUserId(request)
	const subscription = await getUserSubscription(userId)
	const stripeConfigured = Boolean(process.env.STRIPE_SECRET_KEY)

	return json({ subscription, plans: PLAN_DETAILS, stripeConfigured })
}

const SubscriptionActionSchema = z.object({
	intent: z.enum(['checkout', 'manage']),
	plan: z.enum(['pro', 'premium']).optional(),
	interval: z.enum(['monthly', 'yearly']).optional(),
})

export async function action({ request }: ActionFunctionArgs) {
	const userId = await requireUserId(request)
	const formData = await request.formData()
	const intent = formData.get('intent')

	if (intent === 'checkout') {
		const plan = formData.get('plan') as string
		const interval = formData.get('interval') as string

		const priceEnvKey = `STRIPE_PRICE_${plan.toUpperCase()}_${interval.toUpperCase()}`
		const priceId = process.env[priceEnvKey]
		if (!priceId) {
			return json({ error: 'Price not configured' }, { status: 400 })
		}

		const user = await prisma.user.findUniqueOrThrow({
			where: { id: userId },
			select: { email: true },
		})

		const url = new URL(request.url)
		const baseUrl = `${url.protocol}//${url.host}`

		const session = await createStripeCheckoutSession({
			userId,
			email: user.email,
			priceId,
			successUrl: `${baseUrl}/settings/profile/subscription?success=true`,
			cancelUrl: `${baseUrl}/settings/profile/subscription?canceled=true`,
		})

		if (!session.url) {
			return json({ error: 'Failed to create checkout session' }, { status: 500 })
		}

		return redirect(session.url)
	}

	if (intent === 'manage') {
		const url = new URL(request.url)
		const baseUrl = `${url.protocol}//${url.host}`

		const session = await createStripeBillingPortalSession({
			userId,
			returnUrl: `${baseUrl}/settings/profile/subscription`,
		})

		return redirect(session.url)
	}

	return json({ error: 'Invalid intent' }, { status: 400 })
}

export default function SubscriptionSettings() {
	const { subscription, plans, stripeConfigured } =
		useLoaderData<typeof loader>()
	const fetcher = useFetcher()
	const isSubmitting = fetcher.state !== 'idle'
	const currentPlan = subscription.plan

	return (
		<div className="flex flex-col gap-8">
			<div>
				<h2 className="text-h4 mb-2">Subscription</h2>
				<p className="text-muted-foreground">
					Manage your subscription plan and billing.
				</p>
			</div>

			{/* Current Plan */}
			<div className="rounded-lg border p-6">
				<div className="flex items-center justify-between">
					<div>
						<h3 className="text-lg font-semibold">
							Current Plan:{' '}
							<span className="capitalize">{currentPlan}</span>
						</h3>
						{subscription.currentPeriodEnd && (
							<p className="text-sm text-muted-foreground">
								{subscription.cancelAtPeriodEnd
									? 'Cancels'
									: 'Renews'}{' '}
								on{' '}
								{new Date(
									subscription.currentPeriodEnd,
								).toLocaleDateString()}
							</p>
						)}
						{subscription.status === 'past_due' && (
							<p className="text-sm text-destructive">
								Payment past due — please update your payment
								method.
							</p>
						)}
					</div>
					{currentPlan !== 'free' &&
						subscription.provider === 'stripe' && (
							<fetcher.Form method="POST">
								<Button
									type="submit"
									name="intent"
									value="manage"
									variant="outline"
									disabled={isSubmitting}
								>
									Manage Billing
								</Button>
							</fetcher.Form>
						)}
				</div>
			</div>

			{/* Plan Cards */}
			{stripeConfigured && (
				<div className="grid gap-6 md:grid-cols-3">
					<PlanCard
						name="Free"
						planKey="free"
						price="$0"
						features={[
							`${plans.free.tanks} tanks`,
							`${plans.free.parameterLogsPerMonth} parameter logs/mo`,
							`${plans.free.coralAnalysesPerMonth} coral analyses/mo`,
							`${plans.free.galleryImagesPerTank} gallery images/tank`,
						]}
						isCurrent={currentPlan === 'free'}
						disabled={isSubmitting}
					/>
					<PlanCard
						name="Pro"
						planKey="pro"
						price="$4.99/mo"
						features={[
							`${plans.pro.tanks} tanks`,
							'Unlimited parameter logs',
							`${plans.pro.coralAnalysesPerMonth} coral analyses/mo`,
							`${plans.pro.galleryImagesPerTank} gallery images/tank`,
						]}
						isCurrent={currentPlan === 'pro'}
						isPopular
						disabled={isSubmitting}
					/>
					<PlanCard
						name="Premium"
						planKey="premium"
						price="$9.99/mo"
						features={[
							'Unlimited tanks',
							'Unlimited parameter logs',
							'Unlimited coral analyses',
							'Unlimited gallery images',
						]}
						isCurrent={currentPlan === 'premium'}
						disabled={isSubmitting}
					/>
				</div>
			)}

			{!stripeConfigured && currentPlan === 'free' && (
				<p className="text-muted-foreground">
					Subscription upgrades are not yet configured. Check back
					soon!
				</p>
			)}
		</div>
	)
}

function PlanCard({
	name,
	planKey,
	price,
	features,
	isCurrent,
	isPopular,
	disabled,
}: {
	name: string
	planKey: string
	price: string
	features: string[]
	isCurrent: boolean
	isPopular?: boolean
	disabled: boolean
}) {
	const fetcher = useFetcher()

	return (
		<div
			className={`relative rounded-lg border p-6 ${
				isPopular ? 'border-primary shadow-md' : ''
			} ${isCurrent ? 'bg-muted/50' : ''}`}
		>
			{isPopular && (
				<span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-0.5 text-xs font-medium text-primary-foreground">
					Most Popular
				</span>
			)}
			<h3 className="text-lg font-semibold">{name}</h3>
			<p className="mt-1 text-2xl font-bold">{price}</p>
			<ul className="mt-4 space-y-2 text-sm">
				{features.map((feature) => (
					<li key={feature} className="flex items-center gap-2">
						<Icon name="check" className="h-4 w-4 text-green-500" />
						{feature}
					</li>
				))}
			</ul>
			{isCurrent ? (
				<Button className="mt-6 w-full" variant="outline" disabled>
					Current Plan
				</Button>
			) : planKey !== 'free' ? (
				<fetcher.Form method="POST">
					<input type="hidden" name="plan" value={planKey} />
					<input type="hidden" name="interval" value="monthly" />
					<StatusButton
						type="submit"
						name="intent"
						value="checkout"
						className="mt-6 w-full"
						disabled={disabled}
						status={
							fetcher.state !== 'idle' ? 'pending' : 'idle'
						}
					>
						Upgrade to {name}
					</StatusButton>
				</fetcher.Form>
			) : null}
		</div>
	)
}
