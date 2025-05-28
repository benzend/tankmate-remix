import { invariantResponse } from '@epic-web/invariant'
import { json, MetaFunction, type LoaderFunctionArgs } from '@remix-run/node'
import { Link, useLoaderData } from '@remix-run/react'
import { requireUserId } from '#app/utils/auth.server.js'
import { prisma } from '#app/utils/db.server.js'
import { getLatestTankScoreAverage } from '#app/utils/misc.js'

export const meta: MetaFunction = () => [{ title: 'TankMate | Dashboard' }]

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
      imageUrl: true,
			fishTankScores: {
				select: {
					result: true,
          imageUrl: true,
				},
			},
		},
		where: {
			userId,
		},
	})

	const tankMaintenanceLog = await prisma.fishTankMaintenance.findMany({
		select: {
			id: true,
			maintenanceType: true,
			extraDetails: true,
			fishTank: {
				select: {
					name: true,
					id: true,
				},
			},
		},
		where: {
			fishTank: {
				userId,
			},
		},
	})

  const tankParameterLog = await prisma.fishTankParameterLog.findMany({
    select: {
      id: true,
      createdAt: true,
      fishTank: {
        select: {
          name: true,
          id: true,
        }
      }
    },
    where: {
      fishTank: {
        userId
      }
    }
  })

	return json({ user, tanks, tankMaintenanceLog, tankParameterLog })
}

export default function Dashboard() {
	const { tanks } = useLoaderData<typeof loader>()

	return (
		<div className="w-full">
			{tanks.length ? (
				<div>
					<div>
						<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
							{tanks.map((tank) => {
                const image = (() => {
                  if (tank.imageUrl) {
                    return tank.imageUrl
                  } else if (tank.fishTankScores.length) {
                    const tankImageUrls = tank.fishTankScores
                      .map((s) => s.imageUrl)
                      .filter(Boolean)

                    if (!tankImageUrls.length) {
                      return null
                    }

                    return tankImageUrls[tankImageUrls.length - 1]!
                  }
                  return null
                })()

                return (
                  <Tank
                    key={tank.id}
                    name={tank.name}
                    imageUrl={image}
                    tankId={tank.id}
                    score={getLatestTankScoreAverage(tank.fishTankScores as any)}
                  />
                )

              })}
							<Link to="/dashboard/tanks/new">
								<div className="w-full h-full flex justify-center items-center rounded border p-2 bg-foreground text-xs text-background">
									+ Add Tank
								</div>
							</Link>

						</div>

						<div>
						</div>
					</div>
				</div>
			) : (
				<Link to="/dashboard/tanks/new" className="text-foreground">+ Add your first tank</Link>
			)}
		</div>
	)
}

const Tank = ({
	tankId,
	name,
  imageUrl,
}: {
	tankId: string
	name: string
  imageUrl: string | null
	score: number
}) => {
	return (
		<div>
			<Link to={`/dashboard/tanks/${tankId}`}>
				<div
					className="p-2 border h-full w-full min-h-[130px]"
				>
          <h3 className="text-xl mb-2 text-foreground">{name}</h3>
          {imageUrl && (
            <img
              height="100%"
              width="auto"
              className="max-h-[100px] max-w-full"
              src={imageUrl}
              alt={name}
            />
          )}
				</div>
			</Link>
		</div>
	)
}
