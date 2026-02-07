import { View, Text, FlatList, Pressable, RefreshControl } from 'react-native'
import { Image } from 'expo-image'
import { useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useCoralAnalyses } from '../../hooks/useCorals'
import { HealthRing } from '../../components/tank/HealthRing'
import { EmptyState } from '../../components/common/EmptyState'
import { Skeleton } from '../../components/ui/Skeleton'
import { colors } from '../../theme/colors'
import { type CoralAnalysis } from '../../lib/api'

export default function CoralScreen() {
	const router = useRouter()
	const { data: analyses, isLoading, refetch, isRefetching } = useCoralAnalyses()

	const renderItem = ({ item }: { item: CoralAnalysis }) => (
		<Pressable
			onPress={() => router.push(`/coral/${item.id}`)}
			style={({ pressed }) => ({
				borderRadius: 12,
				overflow: 'hidden',
				borderWidth: 1,
				borderColor: colors.border,
				backgroundColor: colors.card,
				marginBottom: 12,
				opacity: pressed ? 0.9 : 1,
			})}
		>
			{item.imageUrl ? (
				<Image
					source={{ uri: item.imageUrl }}
					style={{ width: '100%', height: 200 }}
					contentFit="cover"
					transition={200}
				/>
			) : null}

			{/* Score badge */}
			<View style={{ position: 'absolute', top: 12, right: 12 }}>
				<HealthRing score={item.healthScore} size={48} strokeWidth={4} />
			</View>

			<View style={{ padding: 12 }}>
				<Text style={{ color: colors.foreground, fontSize: 18, fontWeight: '600' }}>
					{item.friendlyName}
				</Text>
				<Text style={{ color: colors.mutedForeground, fontSize: 13, textTransform: 'uppercase', marginTop: 2 }}>
					{item.scientificName}
				</Text>
			</View>
		</Pressable>
	)

	return (
		<SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>
			<View style={{ flex: 1, paddingHorizontal: 16 }}>
				{/* Header */}
				<View
					style={{
						flexDirection: 'row',
						justifyContent: 'space-between',
						alignItems: 'center',
						paddingVertical: 16,
					}}
				>
					<Text
						style={{
							fontSize: 28,
							fontWeight: '700',
							color: colors.foreground,
							fontFamily: 'Jost-Bold',
						}}
					>
						Coral Analyzer
					</Text>
					<Pressable
						onPress={() => router.push('/coral/new')}
						style={({ pressed }) => ({
							width: 44,
							height: 44,
							borderRadius: 22,
							backgroundColor: colors.primary,
							alignItems: 'center',
							justifyContent: 'center',
							opacity: pressed ? 0.8 : 1,
						})}
					>
						<Ionicons name="camera" size={22} color={colors.primaryForeground} />
					</Pressable>
				</View>

				{isLoading ? (
					<View style={{ gap: 12 }}>
						{[1, 2, 3].map((i) => (
							<Skeleton key={i} width="100%" height={260} borderRadius={12} />
						))}
					</View>
				) : !analyses?.length ? (
					<EmptyState
						icon="🔬"
						title="No coral analyses yet"
						description="Take a photo of your coral and let AI assess its health."
						actionLabel="Analyze Coral"
						onAction={() => router.push('/coral/new')}
					/>
				) : (
					<FlatList
						data={analyses}
						keyExtractor={(item) => item.id}
						renderItem={renderItem}
						refreshControl={
							<RefreshControl
								refreshing={isRefetching}
								onRefresh={refetch}
								tintColor={colors.primary}
							/>
						}
						showsVerticalScrollIndicator={false}
					/>
				)}
			</View>
		</SafeAreaView>
	)
}
