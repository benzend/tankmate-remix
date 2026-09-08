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
import { Parameter, PARAMETERS } from '../_tanks+/tanks.$id.index'

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
  const salinity = numberOrNull(body.get('salinity'))
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
      salinity,
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

type Measurement = 'dKH' | 'ppm' | 'pH' | '°F' | 'ppm' | 'sg'

export const getMeasurementFromParameter = (parameter: Parameter): Measurement => {
  switch (parameter) {
    case 'alk':
      return 'dKH'
    case 'calcium':
      return 'ppm'
    case 'magnesium':
      return 'ppm'
    case 'pH':
      return 'pH'
    case 'nitrate':
      return 'ppm'
    case 'phosphate':
      return 'ppm'
    case 'temp':
      return '°F'
    case 'salinity':
      return 'sg'
    default:
      throw new Error(`Unknown parameter: ${parameter}`)
  }
}

const ParameterLabel = ({ parameter }: { parameter: Parameter }) => {
  switch (parameter) {
    case 'alk':
      return <label htmlFor="alk" className="text-foreground">Alk <span>(dKH)</span></label>
    case 'calcium':
      return <label htmlFor="calcium" className="text-foreground">Calcium <span>(ppm)</span></label>
    case 'magnesium':
      return <label htmlFor="magnesium" className="text-foreground">Magnesium <span>(ppm)</span></label>
    case 'pH':
      return <label htmlFor="pH" className="text-foreground">pH</label>
    case 'nitrate':
      return <label htmlFor="nitrate" className="text-foreground">Nitrate <span>(ppm)</span></label>
    case 'phosphate':
      return <label htmlFor="phosphate" className="text-foreground">Phosphate <span>(ppm)</span></label>
    case 'temp':
      return <label htmlFor="temp" className="text-foreground">Temp <span>(°F)</span></label>
    case 'salinity':
      return <label htmlFor="salinity" className="text-foreground">Salinity <span>(sg)</span></label>
  }
}

const ParameterInput = ({ parameter }: { parameter: Parameter }) => {
  switch (parameter) {
    case 'alk':
      return <Input id="alk" name="alk" type="number" step="0.1" placeholder="9.2" />
    case 'calcium':
      return <Input id="calcium" name="calcium" type="number" placeholder="450" />
    case 'magnesium':
      return <Input id="magnesium" name="magnesium" type="number" placeholder="1500" />
    case 'pH':
      return <Input id="pH" name="pH" type="number" step="0.1" placeholder="8.4" />
    case 'nitrate':
      return <Input id="nitrate" name="nitrate" type="number" step="0.1" placeholder="7.0" />
    case 'phosphate':
      return <Input id="phosphate" name="phosphate" type="number" step="0.01" placeholder="0.12" />
    case 'temp':
      return <Input id="temp" name="temp" type="number" placeholder="80.0" step="0.1" />
    case 'salinity':
      return <Input id="salinity" name="salinity" type="number" placeholder="1.025" step="0.001" />
  }
}

const ParameterField = ({ parameter }: { parameter: Parameter }) => {
  return (
    <div>
      <ParameterLabel parameter={parameter} />
      <ParameterInput parameter={parameter} />
    </div>
  )
}

export default function NewParameterLog() {
  const { tanks } = useLoaderData<typeof loader>()
  const [searchParams] = useSearchParams()

  const redirectTo = searchParams.get('redirectTo')
  const tankId = searchParams.get('tankId')
  const parameter = searchParams.get('parameter')

  return (
    <>
      <main className="font-poppins h-full">
        {tankId && (
          <Link to={`/dashboard/tanks/${tankId}`} className="text-foreground">{'<'} Back to Tank</Link>
        )}
        <div className="mt-10">
          <Form method="POST">
            <div className="mb-5 md:w-[800px]">
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
              {parameter ? (
                <div className="mb-5">
                  <ParameterField parameter={parameter as Parameter} />
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-6 w-full">
                  {PARAMETERS.map((parameter) => (
                    <ParameterField key={parameter} parameter={parameter} />
                  ))}
                </div>
              )}
              <div className="mt-5">
                <label htmlFor="createdAt" className="text-foreground">
                  Date
                </label>
                <Input
                  id="createdAt"
                  name="createdAt"
                  type="datetime-local"
                  defaultValue={toLocalISOString(new Date())}
                  placeholder="2023-01-01"
                />
              </div>
            </div>

            {redirectTo && (
              <input type="hidden" name="redirectTo" value={redirectTo} />
            )}

            <div className="mobile-fixed-action">
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
