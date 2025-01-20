import {
  type LoaderFunctionArgs,
} from '@remix-run/node'
import {
  json,
  useLoaderData,
  Link,
} from '@remix-run/react'
import { requireUserId } from '#app/utils/auth.server.js'
import { prisma } from '#app/utils/db.server.js'
import { getLatestTankScoreAverage } from '#app/utils/misc.js'


export async function loader({ request }: LoaderFunctionArgs) {
  const userId = await requireUserId(request, { redirectTo: '/' })

  const tanks = await prisma.fishTank.findMany({
    where: { userId },
    select: {
      id: true,
      name: true,
      fishTankScores: {
        select: {
          id: true,
          result: true,
        },
      },
    },
  })

  return json({ tanks })
}

export default function TankPage() {
  const { tanks } = useLoaderData<typeof loader>()

  return (
		<div className="w-full">
			{tanks.length ? (
				<div className="flex">
					<div className="m-2 w-full sm:w-80">
						<header className="rounded-t border p-4 text-foreground">
							Tanks
						</header>
						<div className="rounded-b border-b border-l border-r">
							{tanks.map((tank) => (
								<Tank
									name={tank.name}
									tankId={tank.id}
									score={getLatestTankScoreAverage(tank.fishTankScores as any)}
								/>
							))}
						</div>
						<div>
							<Link to="/dashboard/tanks/new">
								<div className="w-40 rounded-b border border-t-0 p-2 text-xs text-foreground">
									+ Add Tank
								</div>
							</Link>
						</div>
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
	const borderColor = (function () {
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
				<div
					className={`border-b border-l p-2 text-sm text-accent-foreground ${borderColor}`}
				>
					{name}
				</div>
			</Link>
		</div>
	)
}
