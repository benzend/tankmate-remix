import { prisma } from '#app/utils/db.server.js'
import { type ActionFunctionArgs, json } from '@remix-run/node'
import Stripe from 'stripe'
import { z } from 'zod'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET

// Type for the subscription object
const SubscriptionSchema = z.object({
  id: z.string(),
  status: z.string(),
  customer: z.string(),
metadata: z.object({
  userId: z.string().optional(),
}).optional(),
})

export async function action({
  request,
}: ActionFunctionArgs): Promise<Response> {
  if (request.method !== 'POST') {
    return json({ error: 'Method not allowed' }, { status: 405 })
  }

  const signature = request.headers.get('stripe-signature')

  if (!signature) {
    return json({ error: 'Missing stripe-signature header' }, { status: 400 })
  }

  if (!endpointSecret) {
    return json({ error: 'Missing Stripe webhook secret' }, { status: 500 })
  }

  let event: Stripe.Event

  try {
    const payload = await request.text()
    event = stripe.webhooks.constructEvent(payload, signature, endpointSecret)
  } catch (err: unknown) {
    const error = err as Error
    console.error('⚠️ Webhook signature verification failed:', error)
    return json(
      { error: 'Webhook signature verification failed' },
      { status: 400 },
    )
  }

  try {
    switch (event.type) {
      case 'customer.subscription.trial_will_end': {
        const subscription = SubscriptionSchema.parse(event.data.object)
        await handleSubscriptionTrialEnding(subscription)
        break
      }
      case 'customer.subscription.deleted': {
        const subscription = SubscriptionSchema.parse(event.data.object)
        await handleSubscriptionDeleted(subscription)
        break
      }
      case 'customer.subscription.created': {
        const subscription = SubscriptionSchema.parse(event.data.object)
        await handleSubscriptionCreated(subscription)
        break
      }
      case 'customer.subscription.updated': {
        const subscription = SubscriptionSchema.parse(event.data.object)
        await handleSubscriptionUpdated(subscription)
        break
      }
      case 'entitlements.active_entitlement_summary.updated': {
        const subscription = SubscriptionSchema.parse(event.data.object)
        await handleEntitlementUpdated(subscription)
        break
      }
      default: {
        console.warn(`Unhandled event type: ${event.type}`)
      }
    }

    return json({ received: true })
  } catch (err: unknown) {
    const error = err as Error
    console.error('Error processing webhook:', error)
    return json({ error: 'Error processing webhook' }, { status: 500 })
  }
}

async function handleSubscriptionTrialEnding(
  subscription: z.infer<typeof SubscriptionSchema>,
) {
  console.log('Processing trial ending:', subscription.id)
  try {
    // Find and update user with this subscription ID
    await prisma.user.updateMany({
      where: { subscriptionId: subscription.id },
      data: {
        subscriptionStatus: 'trialing',
      },
    })
  } catch (error) {
    console.error('Error updating trial status:', error)
  }
}

async function handleSubscriptionDeleted(
  subscription: z.infer<typeof SubscriptionSchema>,
) {
  console.log('Processing subscription deletion:', subscription.id)
  try {
    // Find and update user with this subscription ID
    await prisma.user.updateMany({
      where: { subscriptionId: subscription.id },
      data: {
        subscriptionId: null,
        subscriptionStatus: 'inactive',
      },
    })
  } catch (error) {
    console.error('Error removing user subscription:', error)
  }
}

async function handleSubscriptionCreated(
  subscription: z.infer<typeof SubscriptionSchema>,
) {
  console.log('Processing subscription creation:', subscription.id)
  try {
    // Get the customer to find the associated user
    const customer = await stripe.customers.retrieve(subscription.customer) as Stripe.Customer
    const userId = subscription.metadata?.userId || (customer.metadata as Record<string, string>)?.userId

    if (!userId) {
      console.error('No userId found in subscription or customer metadata')
      return
    }

    // Update user with subscription info
    await prisma.user.update({
      where: { id: userId },
      data: {
        subscriptionId: subscription.id,
        subscriptionStatus: subscription.status,
      },
    })
  } catch (error) {
    console.error('Error creating user subscription:', error)
  }
}

async function handleSubscriptionUpdated(
  subscription: z.infer<typeof SubscriptionSchema>,
) {
  console.log('Processing subscription update:', subscription.id)
  try {
    // Find user with this subscription ID
    const user = await prisma.user.findFirst({
      where: { subscriptionId: subscription.id },
    })

    if (!user) {
      // Fallback to customer metadata if no user found
      const customer = await stripe.customers.retrieve(subscription.customer) as Stripe.Customer
      const userId = subscription.metadata?.userId || (customer.metadata as Record<string, string>)?.userId

      if (!userId) {
        console.error('No user found for subscription:', subscription.id)
        return
      }

      await prisma.user.update({
        where: { id: userId },
        data: {
          subscriptionId: subscription.id,
          subscriptionStatus: subscription.status,
        },
      })
      return
    }

    // Update existing user's subscription status
    await prisma.user.update({
      where: { id: user.id },
      data: {
        subscriptionStatus: subscription.status,
      },
    })
  } catch (error) {
    console.error('Error updating user subscription:', error)
  }
}

async function handleEntitlementUpdated(
  subscription: z.infer<typeof SubscriptionSchema>,
) {
  console.log('Processing entitlement update:', subscription.id)
  try {
    // Find user with this subscription ID
    const user = await prisma.user.findFirst({
      where: { subscriptionId: subscription.id },
    })

    if (!user) {
      console.error('No user found for subscription:', subscription.id)
      return
    }

    // Update user's entitlements
    await prisma.user.update({
      where: { id: user.id },
      data: {
        // You might want to add specific entitlement fields to your user model
        subscriptionStatus: subscription.status,
        // entitlements: subscription.entitlements, // Add this field if needed
      },
    })
  } catch (error) {
    console.error('Error updating user entitlements:', error)
  }
}
