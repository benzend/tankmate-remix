import { invariantResponse } from '@epic-web/invariant'
import { type LoaderFunctionArgs } from '@remix-run/node'
import { json, Link, useLoaderData } from '@remix-run/react'
import { requireUserId } from '#app/utils/auth.server.js'
import { prisma } from '#app/utils/db.server.js'
import { DateFrom } from '#app/utils/misc.js'

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

	const tankParameterLog = await prisma.fishTankParameterLog.findMany({
		select: {
			id: true,
      createdAt: true,
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

	return json({ user, tanks, tankParameterLog })
}

export default function DashboardParameterPage() {
	const { tankParameterLog } = useLoaderData<typeof loader>()

	return (
		<div className="m-2 w-full sm:w-80">
			<header className="rounded-t border p-4 text-foreground">
				Parameter Log
			</header>
			<div className="rounded-b border-b border-l border-r">
				{tankParameterLog.length ? (
					tankParameterLog.map((log) => (
						<ParameterLog
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
				<Link to="/dashboard/maintenance/new">
					<div className="w-40 rounded-b border border-t-0 p-2 text-xs text-foreground">
						+ Add Log
					</div>
				</Link>
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
