import { useState } from 'react'
import {
	View,
	Text,
	FlatList,
	Pressable,
	RefreshControl,
	Modal,
	Dimensions,
} from 'react-native'
import { Image } from 'expo-image'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import * as Haptics from 'expo-haptics'
import { useQuery } from '@tanstack/react-query'
import { galleryApi, tanksApi, type GalleryImage } from '../../lib/api'
import { EmptyState } from '../../components/common/EmptyState'
import { Skeleton } from '../../components/ui/Skeleton'
import { FadeIn } from '../../components/ui/Animated'
import { colors } from '../../theme/colors'

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window')

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

	const [viewerImage, setViewerImage] = useState<GalleryImage | null>(null)

	const openViewer = (img: GalleryImage) => {
		Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
		setViewerImage(img)
	}

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
						renderItem={({ item, index }) => (
							<FadeIn delay={index * 80}>
								<View style={{ marginBottom: 24 }}>
									<View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
										<Text
											style={{
												color: colors.foreground,
												fontSize: 20,
												fontWeight: '600',
											}}
										>
											{item.tank.name}
										</Text>
										<Text style={{ color: colors.mutedForeground, fontSize: 13 }}>
											{item.images.length} photos
										</Text>
									</View>
									<FlatList
										horizontal
										data={item.images}
										keyExtractor={(img) => img.id}
										showsHorizontalScrollIndicator={false}
										contentContainerStyle={{ gap: 8 }}
										renderItem={({ item: img }) => (
											<Pressable
												onPress={() => openViewer(img)}
												accessibilityRole="image"
												accessibilityLabel={img.title || 'Gallery photo'}
												style={({ pressed }) => ({
													borderRadius: 8,
													overflow: 'hidden',
													transform: [{ scale: pressed ? 0.95 : 1 }],
												})}
											>
												<Image
													source={{ uri: img.imageUrl }}
													style={{ width: 140, height: 140 }}
													contentFit="cover"
													transition={200}
												/>
												{img.title ? (
													<View
														style={{
															position: 'absolute',
															bottom: 0,
															left: 0,
															right: 0,
															backgroundColor: 'rgba(0,0,0,0.6)',
															paddingHorizontal: 8,
															paddingVertical: 4,
														}}
													>
														<Text
															style={{ color: '#fff', fontSize: 11 }}
															numberOfLines={1}
														>
															{img.title}
														</Text>
													</View>
												) : null}
											</Pressable>
										)}
									/>
								</View>
							</FadeIn>
						)}
					/>
				)}
			</View>

			{/* Full-screen image viewer modal */}
			<Modal
				visible={!!viewerImage}
				transparent
				animationType="fade"
				onRequestClose={() => setViewerImage(null)}
			>
				<View
					style={{
						flex: 1,
						backgroundColor: 'rgba(0,0,0,0.95)',
						justifyContent: 'center',
						alignItems: 'center',
					}}
				>
					{/* Close button */}
					<Pressable
						onPress={() => setViewerImage(null)}
						accessibilityRole="button"
						accessibilityLabel="Close image viewer"
						style={{
							position: 'absolute',
							top: 60,
							right: 20,
							zIndex: 10,
							width: 40,
							height: 40,
							borderRadius: 20,
							backgroundColor: 'rgba(255,255,255,0.15)',
							alignItems: 'center',
							justifyContent: 'center',
						}}
					>
						<Ionicons name="close" size={24} color="#fff" />
					</Pressable>

					{/* Image */}
					{viewerImage ? (
						<Image
							source={{ uri: viewerImage.imageUrl }}
							style={{ width: SCREEN_WIDTH, height: SCREEN_HEIGHT * 0.7 }}
							contentFit="contain"
							transition={200}
						/>
					) : null}

					{/* Caption */}
					{viewerImage?.title || viewerImage?.description ? (
						<View
							style={{
								position: 'absolute',
								bottom: 80,
								left: 20,
								right: 20,
							}}
						>
							{viewerImage.title ? (
								<Text style={{ color: '#fff', fontSize: 18, fontWeight: '600', textAlign: 'center' }}>
									{viewerImage.title}
								</Text>
							) : null}
							{viewerImage.description ? (
								<Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14, textAlign: 'center', marginTop: 4 }}>
									{viewerImage.description}
								</Text>
							) : null}
						</View>
					) : null}
				</View>
			</Modal>
		</SafeAreaView>
	)
}
