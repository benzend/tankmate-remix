import { type ActionFunctionArgs, json, redirect } from '@remix-run/node'
import Stripe from 'stripe'
import { z } from 'zod'
import { requireUserId } from '#app/utils/auth.server.js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

const BodySchema = z.object({
  lookup_key: z.string(),
})

export async function action({ request }: ActionFunctionArgs) {
  console.log('data', { request })
  await requireUserId(request, { redirectTo: '/' })

  const data = await request.formData()
  const parsedResult = BodySchema.safeParse({
    lookup_key: data.get('lookup_key'),
  })

  if (parsedResult.error) {
    console.error('invalid schema parse error', parsedResult.error.message)

    return json({
      error: {
        messages: [
          { title: 'Invalid data', message: 'Invalid data structure received' },
        ],
      },
    })
  }

  const body = parsedResult.data

  const priceRes = await stripe.prices.list({
    lookup_keys: [body.lookup_key],
    expand: ['data.product'],
  })

  if (!priceRes.data.length) {
    console.error(
      'stripe is not hooked up correctly. there are no prices listed',
    )
    return json({
      error: {
        messages: [
          { title: 'Server error', message: 'Stripe is not connected' },
        ],
      },
    })
  }

  const session = await stripe.checkout.sessions.create({
    billing_address_collection: 'auto',
    line_items: [
      {
        price: priceRes.data[0]?.id,
        // For metered billing, do not pass quantity
        quantity: 1,
      },
    ],
    mode: 'subscription',
    success_url: `https://tankmate.tech/?success=true&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `https://tankmate.tech/?canceled=true`,
  })

  return redirect(session.url || 'https://tankmate.tech/stripe/confirm')
}
