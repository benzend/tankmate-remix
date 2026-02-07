import { View, FlatList, Pressable, Text, RefreshControl } from 'react-native'
import { useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useTanks } from '../../hooks/useTanks'
import { TankCard } from '../../components/tank/TankCard'
import { EmptyState } from '../../components/common/EmptyState'
import { Skeleton } from '../../components/ui/Skeleton'
import { colors } from '../../theme/colors'

export default function DashboardScreen() {
	const router = useRouter()
	const { data: tanks, isLoading, refetch, isRefetching } = useTanks()

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
						My Tanks
					</Text>
					<Pressable
						onPress={() => router.push('/tank/new')}
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
						<Ionicons name="add" size={24} color={colors.primaryForeground} />
					</Pressable>
				</View>

				{/* Loading state */}
				{isLoading ? (
					<View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 16 }}>
						{[1, 2, 3, 4].map((i) => (
							<View key={i} style={{ width: '47%' }}>
								<Skeleton width="100%" height={180} borderRadius={12} />
							</View>
						))}
					</View>
				) : !tanks?.length ? (
					<EmptyState
						icon="🐠"
						title="No tanks yet"
						description="Add your first tank to start tracking water parameters and logging maintenance."
						actionLabel="Add Tank"
						onAction={() => router.push('/tank/new')}
					/>
				) : (
					<FlatList
						data={tanks}
						numColumns={2}
						keyExtractor={(item) => item.id}
						columnWrapperStyle={{ gap: 16, marginBottom: 16 }}
						renderItem={({ item }) => <TankCard tank={item} />}
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
