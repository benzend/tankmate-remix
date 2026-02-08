import { useState, useCallback } from 'react'
import {
	View,
	Text,
	FlatList,
	Pressable,
	Alert,
	Modal,
	Dimensions,
	RefreshControl,
} from 'react-native'
import { Image } from 'expo-image'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import * as Haptics from 'expo-haptics'
import * as ImagePicker from 'expo-image-picker'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { galleryApi, type GalleryImage } from '../../../lib/api'
import { Button } from '../../../components/ui/Button'
import { Skeleton } from '../../../components/ui/Skeleton'
import { EmptyState } from '../../../components/common/EmptyState'
import { useToast } from '../../../components/ui/Toast'
import { FadeIn } from '../../../components/ui/Animated'
import { colors } from '../../../theme/colors'

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window')
const IMAGE_SIZE = (SCREEN_WIDTH - 48) / 2

export default function TankGalleryScreen() {
	const { id: tankId } = useLocalSearchParams<{ id: string }>()
	const router = useRouter()
	const toast = useToast()
	const queryClient = useQueryClient()

	const { data: images, isLoading, refetch, isRefetching } = useQuery({
		queryKey: ['gallery', tankId],
		queryFn: async () => (await galleryApi.listForTank(tankId)).gallery,
		enabled: !!tankId,
	})

	const deleteImage = useMutation({
		mutationFn: (imageId: string) => galleryApi.delete(imageId),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['gallery', tankId] })
			queryClient.invalidateQueries({ queryKey: ['galleries'] })
			toast.success('Image deleted')
		},
	})

	const [viewerImage, setViewerImage] = useState<GalleryImage | null>(null)

	const handleAddPhotos = async () => {
		const permission = await ImagePicker.requestMediaLibraryPermissionsAsync()
		if (!permission.granted) {
			Alert.alert('Permission Required', 'Photo library access is needed.')
			return
		}

		const result = await ImagePicker.launchImageLibraryAsync({
			mediaTypes: ['images'],
			allowsMultipleSelection: true,
			quality: 0.8,
		})

		if (!result.canceled && result.assets.length > 0) {
			// In a production app, you'd upload via UploadThing here
			// then call galleryApi.addImages with the returned URLs
			toast.info(`${result.assets.length} photo(s) selected — upload integration needed`)
		}
	}

	const handleDeleteImage = (image: GalleryImage) => {
		Alert.alert('Delete Image', 'Are you sure?', [
			{ text: 'Cancel', style: 'cancel' },
			{
				text: 'Delete',
				style: 'destructive',
				onPress: () => deleteImage.mutate(image.id),
			},
		])
	}

	if (isLoading) {
		return (
			<SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
				<View style={{ padding: 16, gap: 12 }}>
					<Skeleton width={200} height={28} />
					<View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
						{[1, 2, 3, 4].map((i) => (
							<Skeleton key={i} width={IMAGE_SIZE} height={IMAGE_SIZE} borderRadius={8} />
						))}
					</View>
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
					Gallery
				</Text>
				<Button variant="outline" size="sm" onPress={handleAddPhotos}>
					<View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
						<Ionicons name="add" size={16} color={colors.foreground} />
						<Text style={{ color: colors.foreground, fontSize: 14 }}>Add</Text>
					</View>
				</Button>
			</View>

			{!images?.length ? (
				<EmptyState
					icon="📸"
					title="No photos yet"
					description="Add photos of your tank to track its progress over time."
					actionLabel="Add Photos"
					onAction={handleAddPhotos}
				/>
			) : (
				<FlatList
					data={images}
					numColumns={2}
					keyExtractor={(item) => item.id}
					contentContainerStyle={{ padding: 16 }}
					columnWrapperStyle={{ gap: 8, marginBottom: 8 }}
					refreshControl={
						<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={colors.primary} />
					}
					renderItem={({ item, index }) => (
						<FadeIn delay={index * 40}>
							<Pressable
								onPress={() => {
									Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
									setViewerImage(item)
								}}
								onLongPress={() => handleDeleteImage(item)}
								accessibilityRole="image"
								accessibilityLabel={item.title || 'Gallery photo'}
								accessibilityHint="Tap to view, long press to delete"
								style={({ pressed }) => ({
									width: IMAGE_SIZE,
									height: IMAGE_SIZE,
									borderRadius: 8,
									overflow: 'hidden',
									transform: [{ scale: pressed ? 0.96 : 1 }],
								})}
							>
								<Image
									source={{ uri: item.imageUrl }}
									style={{ width: '100%', height: '100%' }}
									contentFit="cover"
									transition={200}
								/>
								{item.title ? (
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
										<Text style={{ color: '#fff', fontSize: 12 }} numberOfLines={1}>
											{item.title}
										</Text>
									</View>
								) : null}
							</Pressable>
						</FadeIn>
					)}
				/>
			)}

			{/* Full-screen viewer */}
			<Modal
				visible={!!viewerImage}
				transparent
				animationType="fade"
				onRequestClose={() => setViewerImage(null)}
			>
				<View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.95)', justifyContent: 'center' }}>
					<Pressable
						onPress={() => setViewerImage(null)}
						accessibilityLabel="Close"
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

					{viewerImage ? (
						<Image
							source={{ uri: viewerImage.imageUrl }}
							style={{ width: SCREEN_WIDTH, height: SCREEN_HEIGHT * 0.7 }}
							contentFit="contain"
						/>
					) : null}

					{viewerImage ? (
						<View style={{ position: 'absolute', bottom: 80, left: 20, right: 20, alignItems: 'center' }}>
							{viewerImage.title ? (
								<Text style={{ color: '#fff', fontSize: 17, fontWeight: '600' }}>
									{viewerImage.title}
								</Text>
							) : null}
							{viewerImage.description ? (
								<Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14, marginTop: 4 }}>
									{viewerImage.description}
								</Text>
							) : null}
							<Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, marginTop: 8 }}>
								{new Date(viewerImage.createdAt).toLocaleDateString()}
							</Text>

							{/* Delete from viewer */}
							<Pressable
								onPress={() => {
									setViewerImage(null)
									handleDeleteImage(viewerImage)
								}}
								style={{
									marginTop: 16,
									flexDirection: 'row',
									alignItems: 'center',
									gap: 6,
									paddingHorizontal: 16,
									paddingVertical: 8,
									borderRadius: 20,
									backgroundColor: 'rgba(255,255,255,0.1)',
								}}
							>
								<Ionicons name="trash-outline" size={16} color={colors.negativeRed} />
								<Text style={{ color: colors.negativeRed, fontSize: 14 }}>Delete</Text>
							</Pressable>
						</View>
					) : null}
				</View>
			</Modal>
		</SafeAreaView>
	)
}
