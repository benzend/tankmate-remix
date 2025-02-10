import { invariantResponse } from '@epic-web/invariant'
import { json, MetaFunction, type LoaderFunctionArgs } from '@remix-run/node'
import { Link, useLoaderData } from '@remix-run/react'
import { requireUserId } from '#app/utils/auth.server.js'
import { prisma } from '#app/utils/db.server.js'
import { DateFrom, getLatestTankScoreAverage, humanize, toTitleCase } from '#app/utils/misc.js'

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
	const { tanks, tankMaintenanceLog, tankParameterLog } = useLoaderData<typeof loader>()

	return (
		<div className="w-full">
			{tanks.length ? (
				<div className="flex flex-wrap">
					<div className="m-2 w-full sm:w-80">
						<header className="rounded-t border p-4 text-foreground">
							Tanks
						</header>
						<div className="rounded-b border-b border-l border-r">
							{tanks.map((tank) => (
								<Tank
                  key={tank.id}
									name={tank.name}
									tankId={tank.id}
									score={getLatestTankScoreAverage(tank.fishTankScores as any)}
								/>
							))}
						</div>
						<div>
							<Link to="/dashboard/tanks/new">
								<div className="w-40 rounded-b border border-t-0 p-2 text-xs text-foreground">
									+ Add New Tank
								</div>
							</Link>
						</div>
					</div>
					<div className="m-2 w-full sm:w-80">
						<header className="rounded-t border p-4 text-foreground">
							Maintenance Log
						</header>
						<div className="rounded-b border-b border-l border-r">
							{tankMaintenanceLog.length ? (
								tankMaintenanceLog.map((log) => (
									<MaintenanceLog
                    key={log.id}
										logId={log.id}
										maintenanceType={log.maintenanceType}
										tankId={log.fishTank?.id}
										tankName={log.fishTank?.name}
									></MaintenanceLog>
								))
							) : (
								<div className="border-b border-l p-2 text-sm text-accent-foreground">
									No Logs
								</div>
							)}
						</div>
						<div>
							<Link to="/dashboard/maintenance/new">
								<div className="w-40 rounded-b border border-t-0 p-2 text-xs text-foreground">
									+ Add Log
								</div>
							</Link>
						</div>
					</div>

					<div className="m-2 w-full sm:w-80">
						<header className="rounded-t border p-4 text-foreground">
							Parameter Log
						</header>
						<div className="rounded-b border-b border-l border-r">
							{tankParameterLog.length ? (
								tankParameterLog.map((log) => (
									<ParameterLog
                    key={log.id}
										logId={log.id}
										createdAt={log.createdAt}
										tankId={log.fishTank?.id}
										tankName={log.fishTank?.name}
									></ParameterLog>
								))
							) : (
								<div className="border-b border-l p-2 text-sm text-accent-foreground">
									No Logs
								</div>
							)}
						</div>
						<div>
							<Link to="/dashboard/parameter-log/new">
								<div className="w-40 rounded-b border border-t-0 p-2 text-xs text-foreground">
									+ Add Parameters
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

const MaintenanceLog = ({
	logId,
	maintenanceType,
	tankId,
	tankName,
}: {
	logId: string
	maintenanceType: string
	tankId?: string
	tankName?: string
}) => {
	return (
		<div>
			<div className="flex justify-between border-b border-l p-2 text-sm text-accent-foreground">
				<Link to={`/dashboard/maintenance/${logId}`}>
					{toTitleCase(humanize(maintenanceType))}
				</Link>
				<Link to={`/dashboard/tanks/${tankId}`}>{tankName}</Link>
			</div>
		</div>
	)
}

const ParameterLog = ({
	logId,
  createdAt,
	tankId,
	tankName,
}: {
	logId: string
	createdAt: string
	tankId?: string
	tankName?: string
}) => {
	return (
		<div>
			<div className="flex justify-between border-b border-l p-2 text-sm text-accent-foreground">
				<Link to={`/dashboard/parameter-log/${logId}`}>
					{DateFrom(createdAt).toLocaleDateString()}
				</Link>
				<Link to={`/dashboard/tanks/${tankId}`}>{tankName}</Link>
			</div>
		</div>
	)
}
