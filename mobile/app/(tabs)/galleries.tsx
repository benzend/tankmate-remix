import { View, Text, FlatList, Pressable, RefreshControl } from 'react-native'
import { Image } from 'expo-image'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useQuery } from '@tanstack/react-query'
import { galleryApi, tanksApi, type GalleryImage, type Tank } from '../../lib/api'
import { EmptyState } from '../../components/common/EmptyState'
import { Skeleton } from '../../components/ui/Skeleton'
import { colors } from '../../theme/colors'

export default function GalleriesScreen() {
	const { data: tanks } = useQuery({
		queryKey: ['tanks'],
		queryFn: async () => (await tanksApi.list()).tanks,
	})

	const {
		data: galleries,
		isLoading,
		refetch,
		isRefetching,
	} = useQuery({
		queryKey: ['galleries'],
		queryFn: async () => (await galleryApi.listAll()).galleries,
	})

	// Group galleries by tank
	const tankGalleries = tanks
		?.map((tank) => ({
			tank,
			images: galleries?.filter((g) => g.fishTankId === tank.id) ?? [],
		}))
		.filter((tg) => tg.images.length > 0)

	return (
		<SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>
			<View style={{ flex: 1, paddingHorizontal: 16 }}>
				<View style={{ paddingVertical: 16 }}>
					<Text
						style={{
							fontSize: 28,
							fontWeight: '700',
							color: colors.foreground,
							fontFamily: 'Jost-Bold',
						}}
					>
						Galleries
					</Text>
				</View>

				{isLoading ? (
					<View style={{ gap: 16 }}>
						<Skeleton width="40%" height={24} borderRadius={6} />
						<View style={{ flexDirection: 'row', gap: 8 }}>
							{[1, 2, 3].map((i) => (
								<Skeleton key={i} width={120} height={120} borderRadius={8} />
							))}
						</View>
					</View>
				) : !tankGalleries?.length ? (
					<EmptyState
						icon="📸"
						title="No gallery images yet"
						description="Upload photos of your tanks from the tank detail screen."
					/>
				) : (
					<FlatList
						data={tankGalleries}
						keyExtractor={(item) => item.tank.id}
						refreshControl={
							<RefreshControl
								refreshing={isRefetching}
								onRefresh={refetch}
								tintColor={colors.primary}
							/>
						}
						showsVerticalScrollIndicator={false}
						renderItem={({ item }) => (
							<View style={{ marginBottom: 24 }}>
								<Text
									style={{
										color: colors.foreground,
										fontSize: 20,
										fontWeight: '600',
										marginBottom: 12,
									}}
								>
									{item.tank.name}
								</Text>
								<FlatList
									horizontal
									data={item.images}
									keyExtractor={(img) => img.id}
									showsHorizontalScrollIndicator={false}
									contentContainerStyle={{ gap: 8 }}
									renderItem={({ item: img }) => (
										<Pressable style={{ borderRadius: 8, overflow: 'hidden' }}>
											<Image
												source={{ uri: img.imageUrl }}
												style={{ width: 140, height: 140 }}
												contentFit="cover"
												transition={200}
											/>
										</Pressable>
									)}
								/>
							</View>
						)}
					/>
				)}
			</View>
		</SafeAreaView>
	)
}
