import { Ionicons } from '@expo/vector-icons'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { View, Text, ScrollView, Pressable, RefreshControl } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { EmptyState } from '../../../components/common/EmptyState'
import { Button } from '../../../components/ui/Button'
import { Card, CardContent } from '../../../components/ui/Card'
import { Skeleton } from '../../../components/ui/Skeleton'
import { useMaintenanceLogs } from '../../../hooks/useMaintenance'
import { colors } from '../../../theme/colors'

const TYPE_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
	water_change: 'water-outline',
	filter_change: 'funnel-outline',
	sand_change: 'layers-outline',
	general: 'build-outline',
	custom: 'ellipsis-horizontal-outline',
}

function formatType(type: string): string {
	return type.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

function getRelativeTime(dateStr: string): string {
	const diff = Date.now() - new Date(dateStr).getTime()
	const days = Math.floor(diff / (1000 * 60 * 60 * 24))
	if (days === 0) return 'Today'
	if (days === 1) return 'Yesterday'
	if (days < 7) return `${days} days ago`
	if (days < 30) return `${Math.floor(days / 7)} weeks ago`
	return new Date(dateStr).toLocaleDateString()
}

export default function MaintenanceHistoryScreen() {
	const { id } = useLocalSearchParams<{ id: string }>()
	const router = useRouter()
	const { data: logs, isLoading, refetch, isRefetching } = useMaintenanceLogs(id)

	if (isLoading) {
		return (
			<SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
				<View style={{ padding: 16, gap: 12 }}>
					<Skeleton width={200} height={28} />
					{[1, 2, 3, 4].map((i) => (
						<Skeleton key={i} width="100%" height={80} borderRadius={12} />
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
					Maintenance History
				</Text>
				<Button
					variant="outline"
					size="sm"
					onPress={() => router.push(`/tank/${id}/log-maint`)}
				>
					<View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
						<Ionicons name="add" size={16} color={colors.foreground} />
						<Text style={{ color: colors.foreground, fontSize: 14 }}>Log</Text>
					</View>
				</Button>
			</View>

			{!logs?.length ? (
				<EmptyState
					icon="🔧"
					title="No maintenance logs"
					description="Log your first maintenance task to start tracking."
					actionLabel="Log Maintenance"
					onAction={() => router.push(`/tank/${id}/log-maint`)}
				/>
			) : (
				<ScrollView
					contentContainerStyle={{ padding: 16, gap: 8 }}
					refreshControl={
						<RefreshControl
							refreshing={isRefetching}
							onRefresh={refetch}
							tintColor={colors.primary}
						/>
					}
				>
					{logs
						.slice()
						.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
						.map((log) => (
							<Card key={log.id} style={{ marginBottom: 4 }}>
								<CardContent>
									<View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 12 }}>
										<View
											style={{
												width: 40,
												height: 40,
												borderRadius: 20,
												backgroundColor: colors.accent,
												alignItems: 'center',
												justifyContent: 'center',
											}}
										>
											<Ionicons
												name={TYPE_ICONS[log.maintenanceType] || 'build-outline'}
												size={20}
												color={colors.foreground}
											/>
										</View>
										<View style={{ flex: 1 }}>
											<Text style={{ color: colors.foreground, fontSize: 16, fontWeight: '600' }}>
												{formatType(log.maintenanceType)}
											</Text>
											<Text style={{ color: colors.mutedForeground, fontSize: 13, marginTop: 2 }}>
												{getRelativeTime(log.createdAt)} — {new Date(log.createdAt).toLocaleDateString()}
											</Text>
											{log.extraDetails ? (
												<Text style={{ color: colors.mutedForeground, fontSize: 14, marginTop: 6 }}>
													{log.extraDetails}
												</Text>
											) : null}
										</View>
									</View>
								</CardContent>
							</Card>
						))}
				</ScrollView>
			)}
		</SafeAreaView>
	)
}
