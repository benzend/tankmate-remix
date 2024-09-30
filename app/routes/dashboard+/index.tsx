import { invariantResponse } from '@epic-web/invariant'
import { json, type LoaderFunctionArgs } from '@remix-run/node'
import { Link, useLoaderData, useLocation } from '@remix-run/react'
import { requireUserId } from '#app/utils/auth.server.js'
import { prisma } from '#app/utils/db.server.js'

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
		<div>
			{tanks.length ? (
				<div className="grid gap-5 md:grid-cols-2 lg:grid-cols-5">
					{tanks.map((tank) => (
						<Tank
							key={tank.id}
							tankId={tank.id}
							name={tank.name}
							note={'MY tank'}
							score={80}
						/>
					))}
				</div>
			) : (
				<Link to="/tanks/new">+ Add your first tank</Link>
			)}
		</div>
	)
}

const Tank = ({
	tankId,
	name,
	score,
	note,
}: {
	tankId: string
	name: string
	score: number
	note: string
}) => {
	const textColor = (function () {
		if (!score) return ''
		if (score > 9) return 'text-green-400'
		if (score > 8) return 'text-green-200'
		if (score > 7) return 'text-yellow-200'
		if (score > 6) return 'text-yellow-400'
		if (score > 5) return 'text-orange-400'
		if (score > 4) return 'text-orange-500'
		return 'text-red-500'
	})()

	const borderColor = (function () {
		if (!score) return ''
		if (score > 9) return 'border-green-400'
		if (score > 8) return 'border-green-200'
		if (score > 7) return 'border-yellow-200'
		if (score > 6) return 'border-yellow-400'
		if (score > 5) return 'border-orange-400'
		if (score > 4) return 'border-orange-500'
		return 'border-red-500'
	})()

	return (
		<div className={`border-b border-l ${borderColor} rounded p-4`}>
			<Link to={`/dashboard/tanks/${tankId}`}>
				<div className={`text-7xl italic ${textColor}`}>{score}</div>
			</Link>
			<Link to={`/dashboard/tanks/${tankId}`}>
				<div className="mb-3 text-sm text-gray-300">{name}</div>
			</Link>
			<Link to={`/dashboard/tanks/${tankId}`}>
				<div className="text-xs">{note}</div>
			</Link>
		</div>
	)
}
