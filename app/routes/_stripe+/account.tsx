import { ActionFunctionArgs, json, redirect } from '@remix-run/node'
import { Form, useNavigation, useActionData } from '@remix-run/react'
import Stripe from 'stripe'
import { requireUserId } from '#app/utils/auth.server.js'
import { prisma } from '#app/utils/db.server.js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

export const action = async ({ request }: ActionFunctionArgs) => {
  const userId = await requireUserId(request)

  const user = await prisma.user.findFirst({
    where: { id: userId },
    select: { subscriptionId: true },
  })

  if (!user) {
    console.error('No user found even though we grabbed their user id:', userId)
    return json({ error: 'failed to find user' }, { status: 403 })
  }

  if (!user.subscriptionId) {
    console.error('No user subscription Id for user:', userId)
    return json({ error: 'No Stripe subscription found' }, { status: 400 })
  }

  try {
    const { url } = await stripe.billingPortal.sessions.create({
      customer: userId,
      return_url: `${process.env.APP_URL}/account`,
    })

    return redirect(url)
  } catch (error) {
    console.error('Error creating portal session:', error)
    return json(
      { error: 'Failed to create billing portal session' },
      { status: 500 },
    )
  }
}

export default function Account() {
  const navigation = useNavigation()
  const actionData = useActionData<typeof action>()
  const isLoading = navigation.state === 'submitting'
  const error = actionData?.error

  return (
    <div className="mx-auto max-w-2xl p-6">
      <h1 className="mb-6 text-2xl font-bold">Account Management</h1>

      {error && (
        <div className="mb-4 text-red-600" role="alert">
          {error}
        </div>
      )}

      <Form method="post">
        <button
          type="submit"
          disabled={isLoading}
          className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 disabled:opacity-50"
        >
          {isLoading ? 'Loading...' : 'Manage Billing'}
        </button>
      </Form>
    </div>
  )
}
