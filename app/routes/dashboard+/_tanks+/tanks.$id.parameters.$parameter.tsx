import {
	Chart,
	CategoryScale,
	LinearScale,
	PointElement,
	LineElement,
	Tooltip,
	type Plugin,
} from 'chart.js'
import { Line as LineChart } from 'react-chartjs-2'
import type { LoaderFunctionArgs } from '@remix-run/node'
import { json, redirect } from '@remix-run/node'
import { Link, useLoaderData, useLocation } from '@remix-run/react'
import { Icon } from '#app/components/ui/icon.js'
import { requireUserId } from '#app/utils/auth.server.js'
import { prisma } from '#app/utils/db.server.js'
import {
	DateFrom,
	formatDateBasedOnRecency,
	humanize,
	toTitleCase,
} from '#app/utils/misc.js'
import { getMeasurementFromParameter } from '../_parameter-log+/parameter-log.new'

Chart.register(CategoryScale)
Chart.register(LinearScale)
Chart.register(PointElement)
Chart.register(LineElement)
Chart.register(Tooltip)

export async function loader({ request, params }: LoaderFunctionArgs) {
	const userId = await requireUserId(request, { redirectTo: '/' })
	const { id: tankId, parameter } = params

	if (
		!parameter ||
		![
			'alk',
			'calcium',
			'magnesium',
			'pH',
			'nitrate',
			'phosphate',
			'temp',
			'salinity',
		].includes(parameter)
	) {
		return redirect(`/dashboard/tanks/${tankId}`)
	}

	const tank = await prisma.fishTank.findFirst({
		where: { id: tankId, userId },
		select: {
			id: true,
			name: true,
			parameterLogs: {
				select: {
					id: true,
					temp: true,
					alk: true,
					calcium: true,
					magnesium: true,
					salinity: true,
					pH: true,
					nitrate: true,
					phosphate: true,
					createdAt: true,
				},
				orderBy: {
					createdAt: 'asc',
				},
			},
			fishTankMaintenances: {
				select: {
					id: true,
					createdAt: true,
					maintenanceType: true,
					extraDetails: true,
				},
				orderBy: {
					createdAt: 'asc',
				},
			},
		},
	})

	if (!tank) {
		return redirect('/dashboard')
	}

	return json({ tank, parameter })
}

const PARAMETERS = [
	'alk',
	'calcium',
	'magnesium',
	'pH',
	'nitrate',
	'phosphate',
	'temp',
	'salinity',
] as const

export type Parameter = (typeof PARAMETERS)[number]

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
		case 'salinity':
			return 'Salinity'
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
		case 'salinity':
			return '#F87171' // red
		default:
			return '#60A5FA' // default blue
	}
}

const getSuccessRangeFromParameter = (
	parameter: Parameter,
): { lower: number; upper: number } => {
	switch (parameter) {
		case 'pH':
			return {
				lower: 8.0,
				upper: 8.4,
			}
		case 'alk':
			return {
				lower: 8.0,
				upper: 12.0,
			}
		case 'calcium':
			return {
				lower: 350,
				upper: 450,
			}
		case 'magnesium':
			return {
				lower: 1180,
				upper: 1460,
			}
		case 'nitrate':
			return {
				lower: 5,
				upper: 10,
			}
		case 'phosphate':
			return {
				lower: 0.3,
				upper: 0.5,
			}
		case 'temp':
			return {
				lower: 76,
				upper: 82,
			}
		case 'salinity':
			return {
				lower: 1.024,
				upper: 1.027,
			}
	}
}

const getMinFromParameter = (parameter: Parameter): number => {
	switch (parameter) {
		case 'pH':
			return 7.5
		case 'alk':
			return 6.0
		case 'calcium':
			return 300
		case 'magnesium':
			return 1000
		case 'nitrate':
			return 0
		case 'phosphate':
			return 0
		case 'temp':
			return 70
		case 'salinity':
			return 1.015
	}
}

const getMaxFromParameter = (parameter: Parameter): number => {
	switch (parameter) {
		case 'pH':
			return 8.8
		case 'alk':
			return 15.0
		case 'calcium':
			return 500
		case 'magnesium':
			return 1600
		case 'nitrate':
			return 20
		case 'phosphate':
			return 1.0
		case 'temp':
			return 86
		case 'salinity':
			return 1.035
	}
}

const successRangePlugin: Plugin<'line'> = {
	id: 'successRange',

	beforeDraw: function (chart, args, options) {
		const { ctx, chartArea, scales } = chart
		const { lower, upper } = options.range
		const { backgroundColor, borderColor, borderWidth, enabled } = options

		if (
			!enabled ||
			lower === undefined ||
			upper === undefined ||
			scales.y === undefined
		) {
			return
		}

		ctx.save()

		const yLowerPixel = scales.y.getPixelForValue(lower)
		const yUpperPixel = scales.y.getPixelForValue(upper)

		ctx.beginPath()
		ctx.rect(
			chartArea.left,
			chartArea.top,
			chartArea.right - chartArea.left,
			chartArea.bottom - chartArea.top,
		)
		ctx.clip()

		ctx.fillStyle = backgroundColor
		ctx.fillRect(
			chartArea.left,
			Math.min(yLowerPixel, yUpperPixel),
			chartArea.right - chartArea.left,
			Math.abs(yLowerPixel - yUpperPixel),
		)

		if (borderWidth > 0) {
			ctx.strokeStyle = borderColor
			ctx.lineWidth = borderWidth
			ctx.strokeRect(
				chartArea.left,
				Math.min(yLowerPixel, yUpperPixel),
				chartArea.right - chartArea.left,
				Math.abs(yLowerPixel - yUpperPixel),
			)
		}

		ctx.restore()
	},
}

Chart.register(successRangePlugin)

export default function ParameterDetailPage() {
	const { tank, parameter } = useLoaderData<typeof loader>()
	const location = useLocation()
	const successRange = getSuccessRangeFromParameter(parameter as Parameter)

	const parameterData = tank.parameterLogs
		.filter((log) => log[parameter as keyof typeof log])
		.map((log) => ({
			value: log[parameter as keyof typeof log] as number,
			date: log.createdAt,
		}))

	const latestValue = parameterData[parameterData.length - 1]?.value
	const values = parameterData.map((d) => d.value)
	const minValue = values.length > 0 ? Math.min(...values) : null
	const maxValue = values.length > 0 ? Math.max(...values) : null
	const avgValue =
		values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : null

	const daysSinceLastReading =
		parameterData.length > 0
			? Math.floor(
					(Date.now() -
						new Date(parameterData[parameterData.length - 1]!.date).getTime()) /
						(1000 * 60 * 60 * 24),
				)
			: null

	return (
		<>
			<header>
				<nav className="mb-4 flex items-center gap-2 text-muted-foreground">
					<Link to="/dashboard/tanks">
						<span className="flex items-center gap-1 hover:text-muted-foreground">
							<Icon name="arrow-left" /> Tanks
						</span>
					</Link>
					<span>/</span>
					<Link
						to={`/dashboard/tanks/${tank.id}`}
						className="hover:text-muted-foreground"
					>
						{tank.name}
					</Link>
				</nav>

				<div className="flex items-start justify-between">
					<div>
						<h1 className="mb-2 text-3xl font-bold text-muted-foreground">
							{humanizeParameter(parameter as Parameter)}
						</h1>
						<p className="text-muted-foreground">
							Target Range: {successRange.lower} - {successRange.upper}{' '}
							{getMeasurementFromParameter(parameter as Parameter)}
						</p>
					</div>

					<Link
						to={`/dashboard/parameter-log/new?redirectTo=${location.pathname}&tankId=${tank.id}&parameter=${parameter}`}
						className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
					>
						<Icon name="plus" className="h-4 w-4" />
						Add Reading
					</Link>
				</div>
			</header>

			<div className="mt-8">
				<div className="mb-7 lg:col-span-3">
					<div className="rounded-lg border bg-card p-6">
						<h2 className="mb-4 text-xl font-semibold text-muted-foreground">
							Parameter History
						</h2>
						<div className="h-96">
							<LineChart
								data={{
									labels: parameterData.map((d) =>
										formatDateBasedOnRecency(
											DateFrom(d.date).toLocaleDateString(),
										),
									),
									datasets: [
										{
											label: humanizeParameter(parameter as Parameter),
											data: parameterData.map((d) => d.value),
											backgroundColor: getChartColorFromParameter(
												parameter as Parameter,
											),
											borderColor: getChartColorFromParameter(
												parameter as Parameter,
											),
											borderWidth: 2,
											pointRadius: 4,
											pointHoverRadius: 6,
											tension: 0.1,
										},
									],
								}}
								options={{
									responsive: true,
									maintainAspectRatio: false,
									plugins: {
										legend: {
											display: false,
										},
										tooltip: {
											backgroundColor: 'rgba(0, 0, 0, 0.8)',
											padding: 12,
											titleFont: {
												size: 14,
											},
											bodyFont: {
												size: 13,
											},
											callbacks: {
												label: function (context) {
													return `${humanizeParameter(parameter as Parameter)}: ${context.parsed.y} ${getMeasurementFromParameter(parameter as Parameter)}`
												},
											},
										},
										// @ts-ignore
										successRange: {
											enabled: true,
											range: getSuccessRangeFromParameter(
												parameter as Parameter,
											),
											backgroundColor: 'rgba(0, 204, 0, 0.1)',
											borderColor: 'rgba(255, 255, 255, 0.2)',
											borderWidth: 1,
										},
									},
									scales: {
										y: {
											min: getMinFromParameter(parameter as Parameter),
											max: getMaxFromParameter(parameter as Parameter),
											title: {
												display: true,
												text: getMeasurementFromParameter(
													parameter as Parameter,
												),
											},
										},
										x: {
											title: {
												display: true,
												text: 'Date',
											},
										},
									},
								}}
								plugins={[successRangePlugin]}
							/>
						</div>
					</div>
				</div>

				<div className="space-y-6">
					<div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
						<div className="rounded-lg border bg-card p-4">
							<h3 className="mb-1 text-sm font-medium text-muted-foreground">
								Current Value
							</h3>
							<p className="text-2xl font-bold text-muted-foreground">
								{latestValue
									? `${latestValue} ${getMeasurementFromParameter(parameter as Parameter)}`
									: 'No data'}
							</p>
						</div>

						<div className="rounded-lg border bg-card p-4">
							<h3 className="mb-1 text-sm font-medium text-muted-foreground">
								Average
							</h3>
							<p className="text-2xl font-bold text-muted-foreground">
								{avgValue
									? `${avgValue.toFixed(1)} ${getMeasurementFromParameter(parameter as Parameter)}`
									: 'No data'}
							</p>
						</div>

						<div className="rounded-lg border bg-card p-4">
							<h3 className="mb-1 text-sm font-medium text-muted-foreground">
								Range
							</h3>
							<p className="text-2xl font-bold text-muted-foreground">
								{minValue !== null && maxValue !== null
									? `${minValue} - ${maxValue} ${getMeasurementFromParameter(parameter as Parameter)}`
									: 'No data'}
							</p>
						</div>

						<div className="rounded-lg border bg-card p-4">
							<h3 className="mb-1 text-sm font-medium text-muted-foreground">
								Days Since Last Reading
							</h3>
							<p className="text-2xl font-bold text-muted-foreground">
								{daysSinceLastReading !== null
									? `${daysSinceLastReading} days`
									: 'No data'}
							</p>
						</div>
					</div>

					{tank.fishTankMaintenances.length > 0 && (
						<div className="rounded-lg border bg-card p-6">
							<h2 className="mb-4 text-xl font-semibold">
								Related Maintenance
							</h2>
							<div className="space-y-3">
								{tank.fishTankMaintenances
									.slice(-5)
									.reverse()
									.map((maintenance) => (
										<div
											key={maintenance.id}
											className="flex items-center justify-between border-b py-2 last:border-b-0"
										>
											<div>
												<p className="font-medium">
													{toTitleCase(humanize(maintenance.maintenanceType))}
												</p>
												<p className="text-sm text-muted-foreground">
													{formatDateBasedOnRecency(
														DateFrom(
															maintenance.createdAt,
														).toLocaleDateString(),
													)}
												</p>
											</div>
											<Link
												to={`/dashboard/maintenance/${maintenance.id}`}
												className="text-sm text-primary hover:underline"
											>
												View Details
											</Link>
										</div>
									))}
							</div>
						</div>
					)}
				</div>
			</div>
		</>
	)
}
