import { invariantResponse } from '@epic-web/invariant'
import { type FishTankScore } from '@prisma/client'
import { json, type LoaderFunctionArgs } from '@remix-run/node'
import { Link, useLoaderData } from '@remix-run/react'
import { requireUserId } from '#app/utils/auth.server.js'
import { prisma } from '#app/utils/db.server.js'
import { tryJsonParse } from '#app/utils/misc.js'

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
      dimensionsWidth: true,
      dimensionsLength: true,
      dimensionsHeight: true,
      fishTankScores: {
        select: {
          result: true,
        },
      },
    },
    where: {
      userId,
    },
  })

  return json({ user, tanks })
}

export default function Dashboard() {
  const { tanks } = useLoaderData<typeof loader>()

  return (
    <div className="w-full">
      {tanks.length ? (
        <div className="m-2 w-full sm:w-80">
          <header className="rounded-t border p-4 text-foreground">Tanks</header>
          <div className="rounded-b border-b border-l border-r">
            {tanks.map((tank) => (
              <Tank name={tank.name} tankId={tank.id} score={getLatestTankScoreAverage(tank.fishTankScores as any)}/>
            ))}
          </div>
          <div>
            <Link to="/dashboard/tanks/new">
              <div className="text-foreground w-40 text-xs rounded-b border border-t-0 p-2">+ Add Tank</div>
            </Link>
          </div>
        </div>
      ) : (
        <Link to="/dashboard/tanks/new">+ Add your first tank</Link>
      )}
    </div>
  )
}

const Tank = ({
  tankId,
  name,
  score,
}: {
  tankId: string
  name: string
  score: number
}) => {
  const borderColor = (function() {
    if (!score) return ''
    if (score > 9) return 'border-l-positive-green'
    if (score > 8) return 'border-l-positive-green'
    if (score > 7) return 'border-l-neutral-yellow'
    if (score > 6) return 'border-l-neutral-yellow'
    if (score > 5) return 'border-l-negative-red'
    if (score > 4) return 'border-l-negative-red'
    return 'border-l-red-500'
  })()

  return (
    <div>
      <Link to={`/dashboard/tanks/${tankId}`}>
        <div className={`border-b border-l p-2 text-sm text-accent-foreground ${borderColor}`}>
          {name}
        </div>
      </Link>
    </div>
  )
}

function getLatestTankScoreAverage(tankScores: Array<FishTankScore>) {
  if (!tankScores) return 80

  const last = tankScores[tankScores.length - 1]

  interface AquariumHealth {
    type: string
    label: string
    score?: number // Score can be optional
    note?: string
  }

  interface FishCount {
    type: string
    label: string
    total: number | string
    range?: string
    note?: string
  }

  interface AquariumData {
    aquarium_health?: {
      water_quality?: AquariumHealth
      plant_health?: AquariumHealth
      aquarium_cleanliness?: AquariumHealth
    }
    fish_count?: {
      tetra_fish?: FishCount
      rasbora?: FishCount
      other_species?: FishCount
    }
  }

  const aquariumData = tryJsonParse(last?.result).unwrapOr({}) as AquariumData

  // Check if aquariumData.aquarium_health exists and has scores
  const healthScores = Object.values(aquariumData.aquarium_health ?? {})
    .map((item) => (typeof item?.score === 'number' ? item.score : null)) // Optional chaining with ?. and type checking
    .filter((score): score is number => score !== null) // Ensure filtering removes nulls

  // Calculate average score only if there are valid scores
  if (healthScores.length > 0) {
    const averageScore =
      healthScores.reduce((acc, score) => acc + score, 0) / healthScores.length
    return averageScore
  } else {
    return 80
  }
}
