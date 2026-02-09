import { useState, useMemo } from 'react'
import { View, Text, ScrollView, Pressable } from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useParameterLogs } from '../../../hooks/useParameters'
import { Skeleton } from '../../../components/ui/Skeleton'
import { Button } from '../../../components/ui/Button'
import { Card, CardContent } from '../../../components/ui/Card'
import { ParameterLineChart } from '../../../components/charts/ParameterLineChart'
import { colors } from '../../../theme/colors'
import { PARAMETER_CONFIG, PARAM_KEYS, type ParamKey } from '../../../lib/parameterConfig'

type TimeRange = '7d' | '30d' | '90d' | 'all'
type ActiveTab = 'charts' | 'stats'

const TIME_RANGES: { key: TimeRange; label: string }[] = [
	{ key: '7d', label: '7D' },
	{ key: '30d', label: '30D' },
	{ key: '90d', label: '90D' },
	{ key: 'all', label: 'All' },
]

const TABS: { key: ActiveTab; label: string }[] = [
	{ key: 'charts', label: 'Charts' },
	{ key: 'stats', label: 'Stats' },
]

function getTimeRangeStart(range: TimeRange): Date | null {
	const now = new Date()
	switch (range) {
		case '7d':
			return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
		case '30d':
			return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
		case '90d':
			return new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
		case 'all':
			return null
	}
}

function MiniChart({ values, color }: { values: number[]; color: string }) {
	if (values.length < 2) return null
	const min = Math.min(...values)
	const max = Math.max(...values)
	const range = max - min || 1
	const height = 60

	return (
		<View style={{ height, width: '100%', flexDirection: 'row', alignItems: 'flex-end', gap: 1 }}>
			{values.map((v, i) => {
				const barHeight = Math.max(4, ((v - min) / range) * height)
				return (
					<View
						key={i}
						style={{
							flex: 1,
							height: barHeight,
							backgroundColor: color,
							borderRadius: 2,
							opacity: 0.7,
						}}
					/>
				)
			})}
		</View>
	)
}

export default function ParameterHistoryScreen() {
	const { id } = useLocalSearchParams<{ id: string }>()
	const router = useRouter()
	const { data: logs, isLoading } = useParameterLogs(id)
	const [timeRange, setTimeRange] = useState<TimeRange>('30d')
	const [activeTab, setActiveTab] = useState<ActiveTab>('charts')

	const filteredLogs = useMemo(() => {
		if (!logs) return []
		const start = getTimeRangeStart(timeRange)
		const sorted = [...logs].sort(
			(a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
		)
		if (!start) return sorted
		return sorted.filter((log) => new Date(log.createdAt) >= start)
	}, [logs, timeRange])

	const parameterSections = useMemo(() => {
		return (PARAM_KEYS as readonly ParamKey[]).map((key) => {
			const config = PARAMETER_CONFIG[key]
			const values = filteredLogs
				.map((log) => log[key])
				.filter((v): v is number => v != null)
			const latest = values[values.length - 1]
			const min = values.length ? Math.min(...values) : null
			const max = values.length ? Math.max(...values) : null
			const avg = values.length ? values.reduce((a, b) => a + b, 0) / values.length : null
			return { key, ...config, values, latest, min, max, avg }
		}).filter((s) => s.values.length > 0)
	}, [filteredLogs])

	const chartDataByParam = useMemo(() => {
		const result: Partial<Record<ParamKey, { timestamp: number; value: number }[]>> = {}
		for (const key of PARAM_KEYS) {
			const points: { timestamp: number; value: number }[] = []
			for (const log of filteredLogs) {
				const val = log[key]
				if (val != null) {
					points.push({ timestamp: new Date(log.createdAt).getTime(), value: val })
				}
			}
			if (points.length > 0) {
				result[key] = points
			}
		}
		return result
	}, [filteredLogs])

	if (isLoading) {
		return (
			<SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
				<View style={{ padding: 16, gap: 12 }}>
					<Skeleton width={200} height={28} />
					{[1, 2, 3].map((i) => (
						<Skeleton key={i} width="100%" height={140} borderRadius={12} />
					))}
				</View>
			</SafeAreaView>
		)
	}

	return (
		<SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
			{/* Header */}
			<View
				style={{
					flexDirection: 'row',
					alignItems: 'center',
					paddingHorizontal: 16,
					paddingVertical: 12,
					borderBottomWidth: 1,
					borderBottomColor: colors.border,
				}}
			>
				<Pressable onPress={() => router.back()} style={{ marginRight: 12 }}>
					<Ionicons name="arrow-back" size={24} color={colors.foreground} />
				</Pressable>
				<Text style={{ color: colors.foreground, fontSize: 20, fontWeight: '600', flex: 1 }}>
					Parameter History
				</Text>
				<Button
					variant="outline"
					size="sm"
					onPress={() => router.push(`/tank/${id}/log-params`)}
				>
					<View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
						<Ionicons name="add" size={16} color={colors.foreground} />
						<Text style={{ color: colors.foreground, fontSize: 14 }}>Log</Text>
					</View>
				</Button>
			</View>

			{/* Time range selector */}
			<View
				style={{
					flexDirection: 'row',
					paddingHorizontal: 16,
					paddingVertical: 12,
					gap: 8,
				}}
			>
				{TIME_RANGES.map((range) => (
					<Pressable
						key={range.key}
						onPress={() => setTimeRange(range.key)}
						style={{
							flex: 1,
							paddingVertical: 8,
							borderRadius: 8,
							backgroundColor: timeRange === range.key ? colors.primary : colors.accent,
							alignItems: 'center',
						}}
					>
						<Text
							style={{
								color: timeRange === range.key ? colors.primaryForeground : colors.mutedForeground,
								fontSize: 14,
								fontWeight: '600',
							}}
						>
							{range.label}
						</Text>
					</Pressable>
				))}
			</View>

			{/* Tab selector */}
			<View
				style={{
					flexDirection: 'row',
					paddingHorizontal: 16,
					paddingBottom: 12,
					gap: 8,
				}}
			>
				{TABS.map((tab) => (
					<Pressable
						key={tab.key}
						onPress={() => setActiveTab(tab.key)}
						style={{
							flex: 1,
							paddingVertical: 8,
							borderRadius: 8,
							backgroundColor: activeTab === tab.key ? colors.primary : colors.accent,
							alignItems: 'center',
						}}
					>
						<Text
							style={{
								color: activeTab === tab.key ? colors.primaryForeground : colors.mutedForeground,
								fontSize: 14,
								fontWeight: '600',
							}}
						>
							{tab.label}
						</Text>
					</Pressable>
				))}
			</View>

			<ScrollView contentContainerStyle={{ padding: 16, gap: 12 }}>
				{parameterSections.length === 0 ? (
					<View style={{ alignItems: 'center', paddingVertical: 40 }}>
						<Text style={{ color: colors.mutedForeground, fontSize: 16 }}>
							No parameter data for this time range
						</Text>
					</View>
				) : activeTab === 'charts' ? (
					/* Charts tab */
					(PARAM_KEYS as readonly ParamKey[]).map((key) => {
						const data = chartDataByParam[key]
						if (!data) return null
						const latest = data[data.length - 1]?.value ?? null
						return (
							<ParameterLineChart
								key={key}
								paramKey={key}
								data={data}
								latestValue={latest}
							/>
						)
					})
				) : (
					/* Stats tab */
					parameterSections.map((section) => (
						<Card key={section.key} style={{ marginBottom: 4 }}>
							<CardContent>
								{/* Parameter header */}
								<View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
									<View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
										<View style={{ width: 4, height: 20, borderRadius: 2, backgroundColor: section.color }} />
										<Text style={{ color: colors.foreground, fontSize: 16, fontWeight: '600' }}>
											{section.label}
										</Text>
									</View>
									<Text style={{ color: colors.foreground, fontSize: 22, fontWeight: '700' }}>
										{section.latest != null ? section.latest : '—'}
										<Text style={{ fontSize: 13, color: colors.mutedForeground }}> {section.unit}</Text>
									</Text>
								</View>

								{/* Mini chart */}
								<MiniChart values={section.values} color={section.color} />

								{/* Stats row */}
								<View style={{ flexDirection: 'row', justifyContent: 'space-around', marginTop: 12 }}>
									<View style={{ alignItems: 'center' }}>
										<Text style={{ color: colors.mutedForeground, fontSize: 11 }}>MIN</Text>
										<Text style={{ color: colors.foreground, fontSize: 14, fontWeight: '500' }}>
											{section.min != null ? section.min.toFixed(1) : '—'}
										</Text>
									</View>
									<View style={{ alignItems: 'center' }}>
										<Text style={{ color: colors.mutedForeground, fontSize: 11 }}>AVG</Text>
										<Text style={{ color: colors.foreground, fontSize: 14, fontWeight: '500' }}>
											{section.avg != null ? section.avg.toFixed(1) : '—'}
										</Text>
									</View>
									<View style={{ alignItems: 'center' }}>
										<Text style={{ color: colors.mutedForeground, fontSize: 11 }}>MAX</Text>
										<Text style={{ color: colors.foreground, fontSize: 14, fontWeight: '500' }}>
											{section.max != null ? section.max.toFixed(1) : '—'}
										</Text>
									</View>
									<View style={{ alignItems: 'center' }}>
										<Text style={{ color: colors.mutedForeground, fontSize: 11 }}>COUNT</Text>
										<Text style={{ color: colors.foreground, fontSize: 14, fontWeight: '500' }}>
											{section.values.length}
										</Text>
									</View>
								</View>
							</CardContent>
						</Card>
					))
				)}

				{/* Log table — always visible below both tabs */}
				{filteredLogs.length > 0 ? (
					<Card style={{ marginTop: 8 }}>
						<CardContent>
							<Text style={{ color: colors.foreground, fontSize: 16, fontWeight: '600', marginBottom: 12 }}>
								Recent Logs
							</Text>
							{filteredLogs
								.slice()
								.reverse()
								.slice(0, 20)
								.map((log) => (
									<View
										key={log.id}
										style={{
											flexDirection: 'row',
											paddingVertical: 8,
											borderBottomWidth: 1,
											borderBottomColor: colors.border,
											flexWrap: 'wrap',
											gap: 8,
										}}
									>
										<Text style={{ color: colors.mutedForeground, fontSize: 12, width: '100%' }}>
											{new Date(log.createdAt).toLocaleDateString()} {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
										</Text>
										<View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
											{(PARAM_KEYS as readonly ParamKey[]).map((key) => {
												const val = log[key]
												if (val == null) return null
												return (
													<Text key={key} style={{ color: colors.foreground, fontSize: 13 }}>
														<Text style={{ color: PARAMETER_CONFIG[key].color }}>{PARAMETER_CONFIG[key].label}: </Text>
														{val}
													</Text>
												)
											})}
										</View>
									</View>
								))}
						</CardContent>
					</Card>
				) : null}
			</ScrollView>
		</SafeAreaView>
	)
}
