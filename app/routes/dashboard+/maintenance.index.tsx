import { invariantResponse } from '@epic-web/invariant'
import { type LoaderFunctionArgs } from '@remix-run/node'
import { json, Link, useLoaderData } from '@remix-run/react'
import { requireUserId } from '#app/utils/auth.server.js'
import { prisma } from '#app/utils/db.server.js'
import { humanize, toTitleCase } from '#app/utils/misc.js'

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

	return json({ user, tanks, tankMaintenanceLog })
}

export default function DashboardMaintenancePage() {
	const { tankMaintenanceLog } = useLoaderData<typeof loader>()

	return (
		<div className="m-2 w-full sm:w-80">
			<header className="rounded-t border p-4 text-foreground">
				Maintenance Log
			</header>
			<div className="rounded-b border-b border-l border-r">
				{tankMaintenanceLog.length ? (
					tankMaintenanceLog.map((log) => (
						<MaintenanceLog
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
