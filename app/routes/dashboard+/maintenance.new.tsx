import { invariantResponse } from '@epic-web/invariant'
import { type ActionFunctionArgs, type LoaderFunctionArgs } from '@remix-run/node'
import { Form, json, redirect, useLoaderData, useLocation, useSearchParams } from '@remix-run/react'
import { Textarea } from '#app/components/ui/textarea.js'
import { requireUserId } from '#app/utils/auth.server.js'
import { prisma } from '#app/utils/db.server.js'
import { Button } from '#app/components/ui/button.js'
import { redirectWithToast } from '#app/utils/toast.server.js'
import { safeRedirect } from 'remix-utils/safe-redirect'

export async function loader({ request }: LoaderFunctionArgs) {
  const userId = await requireUserId(request, { redirectTo: '/' })

  const user = await prisma.user.findFirst({
    select: {
      id: true,
      username: true,
      name: true,
    },
    where: {
      id: userId,
    },
  })

  invariantResponse(user, 'No user', { status: 404 })

  const tanks = await prisma.fishTank.findMany({
    select: {
      id: true,
      name: true,
    },
    where: {
      userId,
    },
  })

  return json({ user, tanks })
}

export async function action({ request }: ActionFunctionArgs) {
  const userId = await requireUserId(request, { redirectTo: '/' })

  const body = await request.formData()

  const tankId = body.get('tankId')
  const extraDetails = body.get('extraDetails') || '';
  const maintenanceType = body.get('maintenanceType');

  if (typeof tankId !== 'string') {
    console.error("typeof tankId !== 'string'", { tankId })
    return json({
      error: {
        messages: [
          {
            title: 'Server error',
            message: 'Failed to have a tankId. Please try again.',
          },
        ],
      },
    })
  }

  if (typeof extraDetails !== 'string') {
    console.error("typeof extraDetails !== 'string'", { extraDetails })
    return json({
      error: {
        messages: [
          {
            title: 'Server error',
            message: 'Extra details is not a string. Please try again.',
          },
        ],
      },
    })
  }

  if (typeof maintenanceType !== 'string') {
    console.error("typeof maintenance !== 'string'", { maintenanceType })
    return json({
      error: {
        messages: [
          {
            title: 'Server error',
            message: 'No valid maintenanceType. Please try again.',
          },
        ],
      },
    })
  }

  const maintenance = await prisma.fishTankMaintenance.create({
    data: {
      maintenanceType,
      extraDetails: extraDetails || '',
      fishTankId: tankId
    },
    select: {
      id: true,
    },
  })

  const redirectTo = body.get('redirectTo') || '/dashboard/maintenance/' + maintenance.id

	return redirectWithToast(
		safeRedirect(redirectTo),
		{
			type: 'success',
			title: 'Log added',
			description: 'Great job on keeping up on your tank maintenance',
		},
		{ status: 302 },
	)
}

export default function NewMaintenanceLog() {
  const { tanks } = useLoaderData<typeof loader>()

  const [searchParams] = useSearchParams()

  const redirectTo = searchParams.get('redirectTo')
  const tankId = searchParams.get('tankId')

  return (
    <>
      <main className="font-poppins h-full">
        <div className="mt-10">
          <Form method="POST">
            <div className="w-60 mb-5">
              {tankId ? (
                <input type="hidden" name="tankId" value={tankId} />
              ) : (
                <>
                  <label className="text-sm text-foreground">Select Tank</label>
                  <br/>
                  <select name="tankId" className="text-black px-2 py-1 rounded mb-5">
                    {tanks.map(tank => <option value={tank.id}>{tank.name}</option>)}
                  </select>
                </>
              )}
              <br/>
              <label className="text-sm text-foreground">Maintenance Type</label>
              <br/>
              <select name="maintenanceType" className="text-black px-2 py-1 rounded mb-5">
                <option value="water_change">Water Change</option>
                <option value="filter_change">Filter Change</option>
                <option value="sand_change">Sand Change</option>
              </select>
              <br/>
              <label className="text-sm text-foreground">Extra Details</label>
              <Textarea
                name="extraDetails"
                placeholder="Leave some extra details about you had to do"
              />
            </div>

            {redirectTo && <input type="hidden" name="redirectTo" value={redirectTo} />}

            <Button type="submit">
              Create
            </Button>
          </Form>
        </div>
      </main>
    </>
  )
}
