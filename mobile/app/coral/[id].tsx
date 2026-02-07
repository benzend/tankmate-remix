import { View, Text, ScrollView, Pressable } from 'react-native'
import { Image } from 'expo-image'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useCoralAnalysis } from '../../hooks/useCorals'
import { HealthRing } from '../../components/tank/HealthRing'
import { Card, CardContent } from '../../components/ui/Card'
import { Skeleton } from '../../components/ui/Skeleton'
import { Button } from '../../components/ui/Button'
import { colors, getHealthColor } from '../../theme/colors'

export default function CoralDetailScreen() {
	const { id } = useLocalSearchParams<{ id: string }>()
	const router = useRouter()
	const { data: coral, isLoading } = useCoralAnalysis(id)

	if (isLoading) {
		return (
			<SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
				<View style={{ padding: 16, gap: 12 }}>
					<Skeleton width="100%" height={300} borderRadius={0} />
					<Skeleton width={200} height={28} />
					<Skeleton width={150} height={18} />
					<Skeleton width="100%" height={120} borderRadius={12} />
				</View>
			</SafeAreaView>
		)
	}

	if (!coral) {
		return (
			<SafeAreaView style={{ flex: 1, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }}>
				<Text style={{ color: colors.mutedForeground, fontSize: 16 }}>Analysis not found</Text>
				<Button onPress={() => router.back()} style={{ marginTop: 16 }} variant="outline">
					Go Back
				</Button>
			</SafeAreaView>
		)
	}

	const healthColor = getHealthColor(coral.healthScore)
	const healthLabel =
		coral.healthScore >= 8 ? 'Excellent' : coral.healthScore >= 6 ? 'Fair' : 'Poor'

	return (
		<SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
			<ScrollView>
				{/* Back button overlay */}
				<View style={{ position: 'absolute', top: 8, left: 8, zIndex: 10 }}>
					<Pressable
						onPress={() => router.back()}
						style={{
							width: 36,
							height: 36,
							borderRadius: 18,
							backgroundColor: 'rgba(0,0,0,0.5)',
							alignItems: 'center',
							justifyContent: 'center',
						}}
					>
						<Ionicons name="arrow-back" size={20} color="#fff" />
					</Pressable>
				</View>

				{/* Coral image */}
				{coral.imageUrl ? (
					<Image
						source={{ uri: coral.imageUrl }}
						style={{ width: '100%', height: 320 }}
						contentFit="cover"
						transition={200}
					/>
				) : (
					<View
						style={{
							width: '100%',
							height: 200,
							backgroundColor: colors.accent,
							alignItems: 'center',
							justifyContent: 'center',
						}}
					>
						<Text style={{ fontSize: 60 }}>🪸</Text>
					</View>
				)}

				<View style={{ padding: 16 }}>
					{/* Name and score */}
					<View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
						<View style={{ flex: 1, marginRight: 16 }}>
							<Text style={{ color: colors.foreground, fontSize: 26, fontWeight: '700', fontFamily: 'Jost-Bold' }}>
								{coral.friendlyName}
							</Text>
							<Text style={{ color: colors.mutedForeground, fontSize: 15, fontStyle: 'italic', marginTop: 4 }}>
								{coral.scientificName}
							</Text>
						</View>
						<HealthRing score={coral.healthScore} size={72} strokeWidth={5} />
					</View>

					{/* Health score card */}
					<Card style={{ marginBottom: 16 }}>
						<CardContent>
							<View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
								<View
									style={{
										width: 48,
										height: 48,
										borderRadius: 24,
										backgroundColor: healthColor + '20',
										alignItems: 'center',
										justifyContent: 'center',
									}}
								>
									<Text style={{ fontSize: 20, fontWeight: '700', color: healthColor }}>
										{coral.healthScore}
									</Text>
								</View>
								<View style={{ flex: 1 }}>
									<Text style={{ color: colors.foreground, fontSize: 16, fontWeight: '600' }}>
										Health: {healthLabel}
									</Text>
									<Text style={{ color: colors.mutedForeground, fontSize: 13, marginTop: 2 }}>
										Score {coral.healthScore} out of 10
									</Text>
								</View>
							</View>
						</CardContent>
					</Card>

					{/* AI Analysis */}
					{coral.otherDetails ? (
						<Card style={{ marginBottom: 16 }}>
							<CardContent>
								<View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 }}>
									<Ionicons name="sparkles" size={18} color={colors.chart.alk} />
									<Text style={{ color: colors.foreground, fontSize: 16, fontWeight: '600' }}>
										AI Analysis
									</Text>
								</View>
								<Text style={{ color: colors.mutedForeground, fontSize: 15, lineHeight: 22 }}>
									{coral.otherDetails}
								</Text>
							</CardContent>
						</Card>
					) : null}

					{/* Date */}
					{coral.createdAt ? (
						<Text style={{ color: colors.mutedForeground, fontSize: 13, textAlign: 'center', marginTop: 8 }}>
							Analyzed on {new Date(coral.createdAt).toLocaleDateString('en-US', {
								year: 'numeric',
								month: 'long',
								day: 'numeric',
							})}
						</Text>
					) : null}
				</View>
			</ScrollView>
		</SafeAreaView>
	)
}
