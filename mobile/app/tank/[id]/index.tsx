import { Ionicons } from '@expo/vector-icons'
import { Image } from 'expo-image'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { View, Text, ScrollView, Pressable, RefreshControl } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Badge } from '../../../components/ui/Badge'
import { Button } from '../../../components/ui/Button'
import { Card, CardContent } from '../../../components/ui/Card'
import { Skeleton } from '../../../components/ui/Skeleton'
import { useTank } from '../../../hooks/useTanks'
import { colors } from '../../../theme/colors'

const PARAMETER_LABELS: Record<string, string> = {
	pH: 'pH',
	alk: 'Alkalinity',
	calcium: 'Calcium',
	magnesium: 'Magnesium',
	nitrate: 'Nitrate',
	phosphate: 'Phosphate',
	temp: 'Temperature',
	salinity: 'Salinity',
}

const PARAMETER_UNITS: Record<string, string> = {
	pH: '',
	alk: 'dKH',
	calcium: 'ppm',
	magnesium: 'ppm',
	nitrate: 'ppm',
	phosphate: 'ppm',
	temp: '°F',
	salinity: 'sg',
}

const PARAMETER_COLORS: Record<string, string> = {
	pH: '#60A5FA',
	alk: '#34D399',
	calcium: '#A78BFA',
	magnesium: '#FBBF24',
	nitrate: '#EC4899',
	phosphate: '#6366F1',
	temp: '#F87171',
	salinity: '#F87171',
}

const GALLERY_THUMB_SIZE = 72

export default function TankDetailScreen() {
	const { id } = useLocalSearchParams<{ id: string }>()
	const router = useRouter()
	const { data: tank, isLoading, refetch, isRefetching } = useTank(id)

	if (isLoading) {
		return (
			<SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
				<View style={{ padding: 16, gap: 12 }}>
					<Skeleton width={200} height={32} />
					<Skeleton width="100%" height={200} borderRadius={12} />
					<Skeleton width="100%" height={120} borderRadius={12} />
				</View>
			</SafeAreaView>
		)
	}

	if (!tank) {
		return (
			<SafeAreaView style={{ flex: 1, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }}>
				<Text style={{ color: colors.mutedForeground, fontSize: 16 }}>Tank not found</Text>
				<Button onPress={() => router.back()} style={{ marginTop: 16 }} variant="outline">
					Go Back
				</Button>
			</SafeAreaView>
		)
	}

	const latestImage =
		tank.imageUrl ||
		tank.fishTankScores?.map((s) => s.imageUrl).filter(Boolean).pop() ||
		null

	// Get latest parameter values
	const latestLog = tank.parameterLogs?.[tank.parameterLogs.length - 1]

	return (
		<SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
			<ScrollView
				refreshControl={
					<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={colors.primary} />
				}
			>
				{/* Header with back button */}
				<View style={{ paddingHorizontal: 16, paddingTop: 8 }}>
					<Pressable onPress={() => router.back()} style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 12 }}>
						<Ionicons name="arrow-back" size={20} color={colors.mutedForeground} />
						<Text style={{ color: colors.mutedForeground }}>Tanks</Text>
					</Pressable>
				</View>

				{/* Tank image */}
				{latestImage ? (
					<Image
						source={{ uri: latestImage }}
						style={{ width: '100%', height: 220 }}
						contentFit="cover"
						transition={200}
					/>
				) : (
					<View
						style={{
							width: '100%',
							height: 160,
							backgroundColor: colors.accent,
							alignItems: 'center',
							justifyContent: 'center',
						}}
					>
						<Text style={{ fontSize: 60 }}>🐠</Text>
					</View>
				)}

				<View style={{ padding: 16 }}>
					{/* Title row */}
					<View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
						<View style={{ flex: 1 }}>
							<Text style={{ color: colors.foreground, fontSize: 28, fontWeight: '700', fontFamily: 'Jost-Bold' }}>
								{tank.name}
							</Text>
							<View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 }}>
								<Badge>{tank.waterType === 'saltwater' ? 'Saltwater' : 'Freshwater'}</Badge>
								{tank.volume ? (
									<Text style={{ color: colors.mutedForeground, fontSize: 14 }}>
										{tank.volume} gal
									</Text>
								) : null}
							</View>
						</View>
						<Pressable
							onPress={() => router.push(`/tank/${id}/edit`)}
							style={{
								width: 36,
								height: 36,
								borderRadius: 18,
								backgroundColor: colors.accent,
								alignItems: 'center',
								justifyContent: 'center',
							}}
						>
							<Ionicons name="pencil" size={16} color={colors.mutedForeground} />
						</Pressable>
					</View>

					{/* Quick Actions */}
					<View style={{ flexDirection: 'row', gap: 8, marginVertical: 20 }}>
						<Button
							variant="outline"
							size="sm"
							onPress={() => router.push(`/tank/${id}/log-params`)}
							style={{ flex: 1 }}
						>
							<View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
								<Ionicons name="analytics-outline" size={16} color={colors.foreground} />
								<Text style={{ color: colors.foreground, fontSize: 14, fontWeight: '500' }}>Log Params</Text>
							</View>
						</Button>
						<Button
							variant="outline"
							size="sm"
							onPress={() => router.push(`/tank/${id}/log-maint`)}
							style={{ flex: 1 }}
						>
							<View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
								<Ionicons name="build-outline" size={16} color={colors.foreground} />
								<Text style={{ color: colors.foreground, fontSize: 14, fontWeight: '500' }}>Log Maint</Text>
							</View>
						</Button>
						<Button
							variant="outline"
							size="sm"
							onPress={() => router.push(`/tank/${id}/gallery`)}
							style={{ flex: 1 }}
						>
							<View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
								<Ionicons name="camera-outline" size={16} color={colors.foreground} />
								<Text style={{ color: colors.foreground, fontSize: 14, fontWeight: '500' }}>Photos</Text>
							</View>
						</Button>
					</View>

					{/* Latest Parameters Grid */}
					{latestLog ? (
						<Card style={{ marginBottom: 16 }}>
							<CardContent>
								<View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
									<Text style={{ color: colors.foreground, fontSize: 18, fontWeight: '600' }}>
										Latest Parameters
									</Text>
									<Pressable onPress={() => router.push(`/tank/${id}/parameters`)}>
										<Text style={{ color: colors.chart.pH, fontSize: 13, fontWeight: '500' }}>View History</Text>
									</Pressable>
								</View>
								<View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
									{Object.entries(PARAMETER_LABELS).map(([key, label]) => {
										const value = latestLog[key as keyof typeof latestLog]
										if (value == null) return null
										return (
											<View
												key={key}
												style={{
													width: '47%',
													borderLeftWidth: 3,
													borderLeftColor: PARAMETER_COLORS[key],
													paddingLeft: 10,
													paddingVertical: 4,
												}}
											>
												<Text style={{ color: colors.mutedForeground, fontSize: 12 }}>
													{label}
												</Text>
												<Text style={{ color: colors.foreground, fontSize: 18, fontWeight: '600' }}>
													{typeof value === 'number' ? value : value}
													<Text style={{ fontSize: 12, color: colors.mutedForeground }}>
														{' '}{PARAMETER_UNITS[key]}
													</Text>
												</Text>
											</View>
										)
									})}
								</View>
							</CardContent>
						</Card>
					) : null}

					{/* Maintenance Logs */}
					<Card style={{ marginBottom: 16 }}>
						<CardContent>
							<View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
								<Text style={{ color: colors.foreground, fontSize: 18, fontWeight: '600' }}>
									Maintenance
								</Text>
								<Pressable onPress={() => router.push(`/tank/${id}/maintenance`)}>
									<Text style={{ color: colors.chart.pH, fontSize: 13, fontWeight: '500' }}>
										{tank.fishTankMaintenances?.length || 0} logs — View All
									</Text>
								</Pressable>
							</View>
							{tank.fishTankMaintenances?.length ? (
								tank.fishTankMaintenances.slice(0, 5).map((log) => (
									<View
										key={log.id}
										style={{
											flexDirection: 'row',
											justifyContent: 'space-between',
											paddingVertical: 8,
											borderBottomWidth: 1,
											borderBottomColor: colors.border,
										}}
									>
										<Text style={{ color: colors.foreground, fontSize: 14, textTransform: 'capitalize' }}>
											{log.maintenanceType.replace(/_/g, ' ')}
										</Text>
										<Text style={{ color: colors.mutedForeground, fontSize: 12 }}>
											{new Date(log.createdAt).toLocaleDateString()}
										</Text>
									</View>
								))
							) : (
								<Text style={{ color: colors.mutedForeground, fontSize: 14 }}>
									No maintenance logs yet
								</Text>
							)}
						</CardContent>
					</Card>

					{/* Gallery Preview */}
					<Card style={{ marginBottom: 16 }}>
						<CardContent>
							<View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
								<Text style={{ color: colors.foreground, fontSize: 18, fontWeight: '600' }}>
									Photos
								</Text>
								<Pressable onPress={() => router.push(`/tank/${id}/gallery`)}>
									<Text style={{ color: colors.chart.pH, fontSize: 13, fontWeight: '500' }}>
										{tank.gallery?.length || 0} photos — View All
									</Text>
								</Pressable>
							</View>
							{tank.gallery?.length ? (
								<ScrollView horizontal showsHorizontalScrollIndicator={false}>
									<View style={{ flexDirection: 'row', gap: 8 }}>
										{tank.gallery.slice(0, 6).map((image) => (
											<Pressable
												key={image.id}
												onPress={() => router.push(`/tank/${id}/gallery`)}
												style={({ pressed }) => ({
													width: GALLERY_THUMB_SIZE,
													height: GALLERY_THUMB_SIZE,
													borderRadius: 8,
													overflow: 'hidden',
													transform: [{ scale: pressed ? 0.95 : 1 }],
												})}
											>
												<Image
													source={{ uri: image.imageUrl }}
													style={{ width: '100%', height: '100%' }}
													contentFit="cover"
													transition={200}
												/>
											</Pressable>
										))}
									</View>
								</ScrollView>
							) : (
								<Pressable
									onPress={() => router.push(`/tank/${id}/gallery`)}
									style={{
										flexDirection: 'row',
										alignItems: 'center',
										justifyContent: 'center',
										gap: 8,
										paddingVertical: 20,
										borderWidth: 1,
										borderColor: colors.border,
										borderStyle: 'dashed',
										borderRadius: 8,
									}}
								>
									<Ionicons name="camera-outline" size={20} color={colors.mutedForeground} />
									<Text style={{ color: colors.mutedForeground, fontSize: 14 }}>
										Add Photos
									</Text>
								</Pressable>
							)}
						</CardContent>
					</Card>
				</View>
			</ScrollView>
		</SafeAreaView>
	)
}
