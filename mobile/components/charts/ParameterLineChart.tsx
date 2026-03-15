import { useState } from 'react'
import { View, Text, type LayoutChangeEvent } from 'react-native'
import Svg, { Path, Rect, Line, Circle, Text as SvgText } from 'react-native-svg'
import { PARAMETER_CONFIG, type ParamKey } from '../../lib/parameterConfig'
import { colors } from '../../theme/colors'
import { Card, CardContent } from '../ui/Card'

type DataPoint = { timestamp: number; value: number }

type Props = {
	paramKey: ParamKey
	data: DataPoint[]
	latestValue: number | null
}

const CHART_HEIGHT = 200
const PAD = { left: 40, right: 16, top: 12, bottom: 24 }

export function ParameterLineChart({ paramKey, data, latestValue }: Props) {
	const config = PARAMETER_CONFIG[paramKey]
	const [chartWidth, setChartWidth] = useState(0)

	const onLayout = (e: LayoutChangeEvent) => {
		setChartWidth(e.nativeEvent.layout.width)
	}

	const plotW = chartWidth - PAD.left - PAD.right
	const plotH = CHART_HEIGHT - PAD.top - PAD.bottom

	// Determine Y domain: extend yBounds to include actual data
	const dataMin = data.length ? Math.min(...data.map((d) => d.value)) : config.yBounds.min
	const dataMax = data.length ? Math.max(...data.map((d) => d.value)) : config.yBounds.max
	const yMin = Math.min(config.yBounds.min, dataMin)
	const yMax = Math.max(config.yBounds.max, dataMax)
	const yRange = yMax - yMin || 1

	// X domain
	const xMin = data.length ? data[0].timestamp : 0
	const xMax = data.length ? data[data.length - 1].timestamp : 1
	const xRange = xMax - xMin || 1

	const scaleX = (t: number) => PAD.left + ((t - xMin) / xRange) * plotW
	const scaleY = (v: number) => PAD.top + plotH - ((v - yMin) / yRange) * plotH

	// Build path
	const pathD = data
		.map((d, i) => `${i === 0 ? 'M' : 'L'}${scaleX(d.timestamp).toFixed(1)},${scaleY(d.value).toFixed(1)}`)
		.join(' ')

	// Y-axis ticks (5 ticks)
	const yTicks = Array.from({ length: 5 }, (_, i) => yMin + (yRange * i) / 4)

	// X-axis ticks (up to 5 evenly spaced)
	const xTickCount = Math.min(5, data.length)
	const xTicks =
		xTickCount > 1
			? Array.from({ length: xTickCount }, (_, i) => xMin + (xRange * i) / (xTickCount - 1))
			: data.length === 1
				? [data[0].timestamp]
				: []

	const formatDate = (ts: number) => {
		const d = new Date(ts)
		return `${d.getMonth() + 1}/${d.getDate()}`
	}

	const formatYValue = (v: number) => {
		if (yRange < 1) return v.toFixed(3)
		if (yRange < 10) return v.toFixed(1)
		return Math.round(v).toString()
	}

	return (
		<Card style={{ marginBottom: 4 }}>
			<CardContent>
				{/* Header */}
				<View
					style={{
						flexDirection: 'row',
						justifyContent: 'space-between',
						alignItems: 'center',
						marginBottom: 8,
					}}
				>
					<View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
						<View
							style={{
								width: 10,
								height: 10,
								borderRadius: 5,
								backgroundColor: config.color,
							}}
						/>
						<Text style={{ color: colors.foreground, fontSize: 16, fontWeight: '600' }}>
							{config.label}
						</Text>
					</View>
					<Text style={{ color: colors.foreground, fontSize: 22, fontWeight: '700' }}>
						{latestValue != null ? latestValue : '—'}
						<Text style={{ fontSize: 13, color: colors.mutedForeground }}> {config.unit}</Text>
					</Text>
				</View>

				{data.length < 2 ? (
					<View
						style={{
							height: CHART_HEIGHT,
							alignItems: 'center',
							justifyContent: 'center',
						}}
					>
						<Text style={{ color: colors.mutedForeground, fontSize: 14 }}>
							Not enough data
						</Text>
					</View>
				) : (
					<View onLayout={onLayout}>
						{chartWidth > 0 && (
							<Svg width={chartWidth} height={CHART_HEIGHT}>
								{/* Success range band */}
								<Rect
									x={PAD.left}
									y={scaleY(config.successRange.upper)}
									width={plotW}
									height={scaleY(config.successRange.lower) - scaleY(config.successRange.upper)}
									fill="rgba(0, 204, 0, 0.1)"
								/>

								{/* Y-axis grid lines */}
								{yTicks.map((tick, i) => (
									<Line
										key={`yg-${i}`}
										x1={PAD.left}
										y1={scaleY(tick)}
										x2={chartWidth - PAD.right}
										y2={scaleY(tick)}
										stroke={colors.border}
										strokeWidth={1}
									/>
								))}

								{/* Data line */}
								<Path d={pathD} stroke={config.color} strokeWidth={2} fill="none" />

								{/* Data dots (only if ≤ 20 points) */}
								{data.length <= 20 &&
									data.map((d, i) => (
										<Circle
											key={`dot-${i}`}
											cx={scaleX(d.timestamp)}
											cy={scaleY(d.value)}
											r={3}
											fill={config.color}
										/>
									))}

								{/* Y-axis labels */}
								{yTicks.map((tick, i) => (
									<SvgText
										key={`yl-${i}`}
										x={PAD.left - 4}
										y={scaleY(tick) + 4}
										fill={colors.mutedForeground}
										fontSize={10}
										textAnchor="end"
									>
										{formatYValue(tick)}
									</SvgText>
								))}

								{/* X-axis labels */}
								{xTicks.map((tick, i) => (
									<SvgText
										key={`xl-${i}`}
										x={scaleX(tick)}
										y={CHART_HEIGHT - 4}
										fill={colors.mutedForeground}
										fontSize={10}
										textAnchor="middle"
									>
										{formatDate(tick)}
									</SvgText>
								))}
							</Svg>
						)}
					</View>
				)}

				{/* Target range */}
				<Text style={{ color: colors.mutedForeground, fontSize: 12, marginTop: 4 }}>
					Target: {config.successRange.lower} – {config.successRange.upper} {config.unit}
				</Text>
			</CardContent>
		</Card>
	)
}
