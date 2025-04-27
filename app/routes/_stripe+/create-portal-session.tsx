import { json, redirect, type ActionFunctionArgs } from '@remix-run/node'
import Stripe from 'stripe'
import { z } from 'zod'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

const CreatePortalSessionSchema = z.object({
  session_id: z.string(),
})

export async function action({ request }: ActionFunctionArgs) {
  if (request.method !== 'POST') {
    return json({ error: 'Method not allowed' }, { status: 405 })
  }

  try {
    const formData = await request.formData()
    const data = Object.fromEntries(formData)
    const { session_id } = CreatePortalSessionSchema.parse(data)

    // Retrieve the checkout session to get the customer ID
    const checkoutSession = await stripe.checkout.sessions.retrieve(session_id)

    if (!checkoutSession.customer) {
      return json(
        { error: 'No customer found for this session' },
        { status: 400 },
      )
    }

    // Create the billing portal session
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: checkoutSession.customer.toString(),
      return_url: `${process.env.PUBLIC_URL || 'http://localhost:3000'}`,
    })

    // Redirect to the portal URL
    return redirect(portalSession.url)
  } catch (err: unknown) {
    const error = err as Error
    console.error('Error creating portal session:', error)
    return json({ error: 'Error creating portal session' }, { status: 500 })
  }
}
