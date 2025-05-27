import {
	type ActionFunctionArgs,
	type LoaderFunctionArgs,
} from '@remix-run/node'
import {
	json,
	redirect,
	useLoaderData,
	Link,
	useSubmit,
	useActionData,
	useLocation,
} from '@remix-run/react'
import {
	Chart,
	CategoryScale,
	LinearScale,
	PointElement,
	LineElement,
} from 'chart.js'
import { useEffect, useState } from 'react'
import { Line as LineChart } from 'react-chartjs-2'
import { requireUserId } from '#app/utils/auth.server.js'
import { prisma } from '#app/utils/db.server.js'
import { DateFrom, humanize, toTitleCase } from '#app/utils/misc.js'
import { cn, formatDateBasedOnRecency } from '#app/utils/misc.tsx'
Chart.register(CategoryScale)
Chart.register(LinearScale)
Chart.register(PointElement)
Chart.register(LineElement)

export async function action({ request, params }: ActionFunctionArgs) {
	const userId = await requireUserId(request, { redirectTo: '/' })
	const data = await request.formData()

	const tank = await prisma.fishTank.findFirst({
		where: { id: params.id, userId },
		select: {
			id: true,
		},
	})

	if (!tank) {
		return redirect('/dashboard')
	}

	const name = data.get('name')

	if (typeof name !== 'string') {
		return json({
			error: `name (${String(name)}) isnt a valid string`,
			success: false,
		})
	}

	if (!name) {
		return json({ error: `name is an empty string`, success: false })
	}

	try {
		await prisma.fishTank.update({
			where: { id: tank.id, userId },
			data: {
				name,
			},
		})
	} catch {
		return json({ error: 'failed to update tank name', success: false })
	}

	return json({ error: null, success: true })
}

export async function loader({ request, params }: LoaderFunctionArgs) {
	const userId = await requireUserId(request, { redirectTo: '/' })

	const tank = await prisma.fishTank.findFirst({
		where: { id: params.id, userId },
		select: {
			id: true,
			name: true,
			fishTankScores: {
				select: {
					id: true,
					result: true,
					imageUrl: true,
				},
			},
			fishTankMaintenances: {
				select: {
					id: true,
					createdAt: true,
					maintenanceType: true,
					extraDetails: true,
				},
			},
			parameterLogs: {
				select: {
					id: true,
					temp: true,
					alk: true,
					calcium: true,
					magnesium: true,
					pH: true,
					nitrate: true,
					phosphate: true,
					createdAt: true,
				},
        take: 5,
        orderBy: {
          createdAt: 'asc',
        }
			},
			imageUrl: true,
			volume: true,
			waterType: true,
		},
	})

	if (!tank) {
		return redirect('/dashboard')
	}

	return json({ tank })
}

export default function TankPage() {
	const actionData = useActionData<typeof action>()

	const { tank } = useLoaderData<typeof loader>()

	const [editName, setEditName] = useState(tank.name)
	const [editingName, setEditingName] = useState(false)

	const location = useLocation()

	const submit = useSubmit()

	const handleEditTankNameClick = () => {
		setEditingName(true)
	}

	const handleCancelEditTankNameClick = () => {
		setEditingName(false)
	}

	const handleInputNameChange = (e: React.FormEvent<HTMLInputElement>) => {
		setEditName(e.currentTarget.value)
	}

	const handleSaveTankNameClick = () => {
		const formData = new FormData()
		formData.append('name', editName)
		submit(formData, { method: 'POST' })
	}

	useEffect(() => {
		if (actionData?.success) {
			setEditingName(false)
		}
	}, [actionData])

	const tankImageUrls = tank.fishTankScores
		.map((s) => s.imageUrl)
		.filter(Boolean)
	const latestImage = tankImageUrls[tankImageUrls.length - 1]

	return (
		<div>
			<header>
				<span className="capitalize text-muted-foreground">
					{tank.waterType}
				</span>
				{typeof tank.volume !== 'undefined' && (
					<span className="ml-1 capitalize text-muted-foreground">
						- {tank.volume} Gal
					</span>
				)}
				{editingName ? (
					<div>
						<input
							type="text"
							value={editName}
							onChange={handleInputNameChange}
							className="mb-10 mr-4 rounded bg-slate-100 px-2 py-2 text-center text-base font-bold text-foreground outline-white dark:bg-slate-800 md:text-lg lg:text-left lg:text-2xl"
						/>
						<button className="mr-4" onClick={handleSaveTankNameClick}>
							Save
						</button>
						<button
							className="text-red-300"
							onClick={handleCancelEditTankNameClick}
						>
							Cancel
						</button>
					</div>
				) : (
					<>
						<div className="mb-10 flex gap-4 align-baseline">
							<h1 className="cursor-pointer text-center text-2xl font-bold text-foreground lg:text-left lg:text-3xl">
								{tank.name}
							</h1>
							<button
								className="text-accent-foreground"
								onClick={handleEditTankNameClick}
							>
								Edit
							</button>
						</div>
					</>
				)}
				{latestImage && (
					<div className="mb-10">
						<img src={latestImage} width="500" height="auto" />
					</div>
				)}
			</header>

      <div className="mt-10">
        <ParameterLogs tank={tank} />
      </div>

			<div className="my-10 flex flex-wrap gap-5">
				<div className="w-full sm:w-80">
					<header className="rounded-t border p-4 text-foreground">
						Maintenance Log
					</header>
					<div className="rounded-b border-b border-l border-r">
						{tank.fishTankMaintenances.length ? (
							tank.fishTankMaintenances.map((log) => (
								<MaintenanceLog
									key={log.id}
									logId={log.id}
									maintenanceType={log.maintenanceType}
									tankId={tank.id}
									tankName={tank.name}
								></MaintenanceLog>
							))
						) : (
							<div className="border-b border-l p-2 text-sm text-accent-foreground">
								No Logs
							</div>
						)}
					</div>
					<div>
						<Link
							to={`/dashboard/maintenance/new?redirectTo=${location.pathname}&tankId=${tank.id}`}
						>
							<div className="w-40 rounded-b border border-t-0 p-2 text-xs text-foreground">
								+ Add Log
							</div>
						</Link>
					</div>
				</div>
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

export const PARAMETERS = ['alk', 'calcium', 'magnesium', 'pH', 'nitrate', 'phosphate', 'temp'] as const;

export type Parameter = typeof PARAMETERS[number];

export const humanizeParameter = (parameter: Parameter) => {
	switch (parameter) {
		case 'alk':
			return 'Alkaline'
		case 'calcium':
			return 'Calcium'
		case 'magnesium':
			return 'Magnesium'
		case 'pH':
			return 'pH'
		case 'nitrate':
			return 'Nitrate'
		case 'phosphate':
			return 'Phosphate'
		case 'temp':
			return 'Temperature'
	}
}

const getChartColorFromParameter = (parameter: Parameter) => {
	switch (parameter) {
		case 'pH':
			return '#60A5FA' // blue
		case 'alk':
			return '#34D399' // green
		case 'calcium':
			return '#A78BFA' // purple
		case 'magnesium':
			return '#FBBF24' // yellow/amber
		case 'nitrate':
			return '#EC4899' // pink
		case 'phosphate':
			return '#6366F1' // indigo
		case 'temp':
			return '#F87171' // red
		default:
			return '#60A5FA' // default blue
	}
}

const ParameterChart = ({
	tank,
	parameter,
}: {
	tank: TankWithLogs
	parameter: Parameter
}) => {
  const location = useLocation()
	return (
		<div className="rounded border p-4 text-foreground">
			<h3 className="mb-2 text-lg font-bold">
        {humanizeParameter(parameter)}
        <Link to={`/dashboard/parameter-log/new?redirectTo=${location.pathname}&tankId=${tank.id}&parameter=${parameter}`}>+</Link>
      </h3>
			<LineChart
				data={{
					labels: tank.parameterLogs.map((l) =>
						formatDateBasedOnRecency(
							DateFrom(l.createdAt).toLocaleDateString(),
						),
					),
					datasets: [
						{
							label: humanizeParameter(parameter),
							data: tank.parameterLogs.map((l) => l[parameter] || null),
							backgroundColor: getChartColorFromParameter(parameter),
							borderColor: getChartColorFromParameter(parameter),
						},
					],
				}}
			/>
		</div>
	)
}

type TankWithLogs = {
	id: string
	name: string
	fishTankScores: Array<{
		id: string
		result: string | null
		imageUrl: string | null
	}>
	fishTankMaintenances: Array<{
		id: string
		createdAt: string
		maintenanceType: string
		extraDetails: string | null
	}>
	parameterLogs: Array<{
		id: string
		temp: number | null
		alk: number | null
		calcium: number | null
		magnesium: number | null
		pH: number | null
		nitrate: number | null
		phosphate: number | null
		createdAt: string
	}>
	imageUrl: string | null
	volume: number | null
	waterType: string
}

const ParameterLogs = ({ tank }: { tank: TankWithLogs }) => {
	const location = useLocation()
	const [isOpen, setIsOpen] = useState(true)
	return (
		<div className="sm:w-120 w-full">
			<header className="flex justify-between rounded-t border p-4 text-foreground">
				<div><span className="mr-2">Parameter Log</span> <Link
					to={`/dashboard/parameter-log/new?redirectTo=${location.pathname}&tankId=${tank.id}`}
        >+</Link></div>
				{tank.parameterLogs.length && (
					<button onClick={() => setIsOpen((prev) => !prev)}>
						{isOpen ? 'Collapse' : 'Expand'}
					</button>
				)}
			</header>
			<div className="rounded-b border-b border-l border-r">
				{tank.parameterLogs.length ? (
					<div
						className={cn('grid grid-cols-1 sm:grid-cols-2 gap-4', !isOpen && 'invisible h-0')}
					>
						<ParameterChart tank={tank} parameter="temp" />
						<ParameterChart tank={tank} parameter="pH" />
						<ParameterChart tank={tank} parameter="alk" />
						<ParameterChart tank={tank} parameter="calcium" />
						<ParameterChart tank={tank} parameter="magnesium" />
						<ParameterChart tank={tank} parameter="nitrate" />
						<ParameterChart tank={tank} parameter="phosphate" />
					</div>
				) : (
					<div className="border-b border-l p-2 text-sm text-accent-foreground">
						No Logs
					</div>
				)}
			</div>
			<div>
				<Link
					to={`/dashboard/parameter-log/new?redirectTo=${location.pathname}&tankId=${tank.id}`}
				>
					<div className="w-40 rounded-b border border-t-0 p-2 text-xs text-foreground">
						+ Add Log
					</div>
				</Link>
			</div>
		</div>
	)
}
