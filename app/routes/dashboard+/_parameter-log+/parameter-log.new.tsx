import { invariantResponse } from '@epic-web/invariant'
import {
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
} from '@remix-run/node'
import {
  Form,
  json,
  useLoaderData,
  useSearchParams,
  Link,
} from '@remix-run/react'
import { safeRedirect } from 'remix-utils/safe-redirect'
import { Button } from '#app/components/ui/button.js'
import { Input } from '#app/components/ui/input.js'
import { requireUserId } from '#app/utils/auth.server.js'
import { prisma } from '#app/utils/db.server.js'
import { dateOrNow, numberOrNull } from '#app/utils/misc.js'
import { redirectWithToast } from '#app/utils/toast.server.js'

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
  await requireUserId(request, { redirectTo: '/' })

  const body = await request.formData()

  const tankId = body.get('tankId')
  const calcium = numberOrNull(body.get('calcium'))
  const alk = numberOrNull(body.get('alk'))
  const magnesium = numberOrNull(body.get('magnesium'))
  const pH = numberOrNull(body.get('pH'))
  const temp = numberOrNull(body.get('temp'))
  const nitrate = numberOrNull(body.get('nitrate'))
  const phosphate = numberOrNull(body.get('phosphate'))
  const createdAt = dateOrNow(body.get('createdAt'))

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

  const log = await prisma.fishTankParameterLog.create({
    data: {
      calcium,
      alk,
      magnesium,
      pH,
      temp,
      nitrate,
      phosphate,
      fishTankId: tankId,
      createdAt: createdAt ? new Date(createdAt) : new Date(),
    },
    select: {
      id: true,
    },
  })

  const redirectTo =
    body.get('redirectTo') || '/dashboard/parameter-log/' + log.id

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

export default function NewParameterLog() {
  const { tanks } = useLoaderData<typeof loader>()
  const [searchParams] = useSearchParams()

  const redirectTo = searchParams.get('redirectTo')
  const tankId = searchParams.get('tankId')

  return (
    <>
      <main className="font-poppins h-full">
        {tankId && (
          <Link to={`/dashboard/tanks/${tankId}`} className="text-foreground">{'<'} Back to Tank</Link>
        )}
        <div className="mt-10">
          <Form method="POST">
            <div className="mb-5 w-60">
              {tankId ? (
                <>
                  <input type="hidden" name="tankId" value={tankId} />
                </>
              ) : (
                <>
                  <label className="text-sm text-foreground">Select Tank</label>
                  <br />
                  <select
                    name="tankId"
                    className="mb-5 rounded px-2 py-1 text-black"
                  >
                    {tanks.map((tank) => (
                      <option value={tank.id}>{tank.name}</option>
                    ))}
                  </select>
                </>
              )}
              <br />
              <label htmlFor="calcium" className="text-foreground">
                Calcium <span>(ppm)</span>
              </label>
              <Input
                id="calcium"
                name="calcium"
                type="number"
                placeholder="450"
              />
              <br />
              <label htmlFor="alk" className="text-foreground">
                Alk <span>(dKH)</span>
              </label>
              <Input
                id="alk"
                name="alk"
                type="number"
                step="0.1"
                placeholder="9.2"
              />
              <br />
              <label htmlFor="magnesium" className="text-foreground">
                Magnesium <span>(ppm)</span>
              </label>
              <Input
                id="magnesium"
                name="magnesium"
                type="number"
                placeholder="1500"
              />
              <br />
              <label htmlFor="pH" className="text-foreground">pH</label>
              <Input
                id="pH"
                name="pH"
                type="number"
                step="0.1"
                placeholder="8.4"
              />
              <br />
              <label htmlFor="temp" className="text-foreground">Temp (°F)</label>
              <Input
                id="temp"
                name="temp"
                type="number"
                placeholder="80.0"
                step="0.1"
              />
              <br />
              <label htmlFor="nitrate" className="text-foreground">Nitrate (ppm)</label>
              <Input
                id="nitrate"
                name="nitrate"
                type="number"
                step="0.1"
                placeholder="7.0"
              />
              <br />
              <label htmlFor="phosphate" className="text-foreground">Phosphate (ppm)</label>
              <Input
                id="phosphate"
                name="phosphate"
                type="number"
                step="0.01"
                placeholder="0.12"
              />
              <br />
              <Input
                id="createdAt"
                name="createdAt"
                type="datetime-local"
                defaultValue={toLocalISOString(new Date())}
                placeholder="2023-01-01"
              />
            </div>

            {redirectTo && (
              <input type="hidden" name="redirectTo" value={redirectTo} />
            )}

            <div className="fixed md:static bottom-5 inset-x-5">
              <Button type="submit" className="w-full md:w-20">
                Log
              </Button>
            </div>
          </Form>
        </div>
      </main>
    </>
  )
}

function toLocalISOString(date: Date) {
  const localDate = new Date(Date.now() - date.getTimezoneOffset() * 60000); //offset in milliseconds. Credit https://stackoverflow.com/questions/10830357/javascript-toisostring-ignores-timezone-offset

  // Optionally remove second/millisecond if needed
  localDate.setSeconds(0);
  localDate.setMilliseconds(0);
  return localDate.toISOString().slice(0, -1);
}
