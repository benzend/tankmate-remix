import { type LoaderFunctionArgs } from '@remix-run/node'
import { json, redirect, useLoaderData } from '@remix-run/react'
import { requireUserId } from '#app/utils/auth.server.js'
import { prisma } from '#app/utils/db.server.js'
import { DateFrom } from '#app/utils/misc.js'

export async function loader({ request, params }: LoaderFunctionArgs) {
  const userId = await requireUserId(request, { redirectTo: '/' })

  const parameterLog = await prisma.fishTankParameterLog.findFirst({
    where: { id: params.id, fishTank: { userId } },
    select: {
      id: true,
      createdAt: true,
      calcium: true,
      pH: true,
      phosphate: true,
      alk: true,
      temp: true,
      magnesium: true,
      salinity: true,
      fishTank: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  })

  if (!parameterLog) {
    return redirect('/dashboard')
  }

  return json({ parameterLog })
}

export default function ParameterLogPage() {
  const { parameterLog } = useLoaderData<typeof loader>()

  return (
    <div>
      <header>
        <label className="text-xs text-foreground">Parameters Log</label>
        <div className="mb-10">
          <h1 className="mr-4 inline font-bold text-foreground md:text-2xl lg:text-left lg:text-3xl">
            {DateFrom(parameterLog.createdAt).toLocaleDateString()} |{' '}
            {DateFrom(parameterLog.createdAt).toLocaleTimeString()}
          </h1>
        </div>
      </header>

      {parameterLog.calcium !== null && (
        <>
          <label className="text-xs text-foreground">Calcium</label>
          <p className="text-foreground">{parameterLog.calcium}</p>
          <br />
        </>
      )}
      {parameterLog.pH !== null && (
        <>
          <label className="text-xs text-foreground">pH</label>
          <p className="text-foreground">{parameterLog.pH}</p>
          <br />
        </>
      )}
      {parameterLog.phosphate !== null && (
        <>
          <label className="text-xs text-foreground">Phosphate</label>
          <p className="text-foreground">{parameterLog.phosphate}</p>
          <br />
        </>
      )}
      {parameterLog.alk !== null && (
        <>
          <label className="text-xs text-foreground">Alk</label>
          <p className="text-foreground">{parameterLog.alk}</p>
          <br />
        </>
      )}
      {parameterLog.temp !== null && (
        <>
          <label className="text-xs text-foreground">Temp</label>
          <p className="text-foreground">{parameterLog.temp}</p>
          <br />
        </>
      )}
      {parameterLog.magnesium !== null && (
        <>
          <label className="text-xs text-foreground">Magnesium</label>
          <p className="text-foreground">{parameterLog.magnesium}</p>
          <br />
        </>
      )}
      {parameterLog.salinity !== null && (
        <>
          <label className="text-xs text-foreground">Salinity</label>
          <p className="text-foreground">{parameterLog.salinity}</p>
          <br />
        </>
      )}
    </div>
  )
}
