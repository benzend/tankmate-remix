import { Ionicons } from '@expo/vector-icons'
import { Image } from 'expo-image'
import * as ImagePicker from 'expo-image-picker'
import { useRouter } from 'expo-router'
import { useState } from 'react'
import { View, Text, Alert, ActivityIndicator } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { HealthRing } from '../../components/tank/HealthRing'
import { Button } from '../../components/ui/Button'
import { useAnalyzeCoral } from '../../hooks/useCorals'
import { useTanks } from '../../hooks/useTanks'
import { type CoralAnalysis } from '../../lib/api'
import { uploadImage } from '../../lib/upload'
import { colors, getHealthColor } from '../../theme/colors'

type Step = 'capture' | 'analyzing' | 'result'

export default function NewCoralAnalysisScreen() {
	const router = useRouter()
	const analyzeCoral = useAnalyzeCoral()
	useTanks()
	const [step, setStep] = useState<Step>('capture')
	const [imageUri, setImageUri] = useState<string | null>(null)
	const [result, setResult] = useState<CoralAnalysis | null>(null)

	const pickImage = async (source: 'camera' | 'gallery') => {
		try {
			let pickerResult: ImagePicker.ImagePickerResult

			if (source === 'camera') {
				const permission = await ImagePicker.requestCameraPermissionsAsync()
				if (!permission.granted) {
					Alert.alert('Permission Required', 'Camera access is needed to take photos.')
					return
				}
				pickerResult = await ImagePicker.launchCameraAsync({
					mediaTypes: ['images'],
					quality: 0.8,
					allowsEditing: true,
					aspect: [4, 3],
				})
			} else {
				const permission = await ImagePicker.requestMediaLibraryPermissionsAsync()
				if (!permission.granted) {
					Alert.alert('Permission Required', 'Photo library access is needed.')
					return
				}
				pickerResult = await ImagePicker.launchImageLibraryAsync({
					mediaTypes: ['images'],
					quality: 0.8,
					allowsEditing: true,
					aspect: [4, 3],
				})
			}

			if (!pickerResult.canceled && pickerResult.assets[0]) {
				setImageUri(pickerResult.assets[0].uri)
			}
		} catch {
			Alert.alert('Error', 'Failed to pick image')
		}
	}

	const handleAnalyze = async () => {
		if (!imageUri) return

		setStep('analyzing')
		try {
			// Upload the image to UploadThing CDN via our server proxy
			const uploaded = await uploadImage(imageUri, `coral-${Date.now()}.jpg`)

			const { coralAnalysis } = await analyzeCoral.mutateAsync({
				imageUrl: uploaded.url,
			})
			setResult(coralAnalysis)
			setStep('result')
		} catch (error: any) {
			setStep('capture')
			Alert.alert('Analysis Failed', error?.data?.error || 'Could not analyze the coral image. Please try again.')
		}
	}

	// ─── Capture Step ─────────────────────────
	if (step === 'capture') {
		return (
			<SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
				{/* Header */}
				<View
					style={{
						flexDirection: 'row',
						alignItems: 'center',
						justifyContent: 'space-between',
						paddingHorizontal: 16,
						paddingVertical: 12,
						borderBottomWidth: 1,
						borderBottomColor: colors.border,
					}}
				>
					<Button variant="ghost" size="sm" onPress={() => router.back()}>
						<View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
							<Ionicons name="close" size={20} color={colors.foreground} />
							<Text style={{ color: colors.foreground, fontSize: 16 }}>Cancel</Text>
						</View>
					</Button>
					<Text style={{ color: colors.foreground, fontSize: 17, fontWeight: '600' }}>
						Analyze Coral
					</Text>
					<View style={{ width: 70 }} />
				</View>

				<View style={{ flex: 1, padding: 16, justifyContent: 'center' }}>
					{imageUri ? (
						<>
							{/* Preview */}
							<View style={{ borderRadius: 16, overflow: 'hidden', marginBottom: 20 }}>
								<Image
									source={{ uri: imageUri }}
									style={{ width: '100%', height: 300 }}
									contentFit="cover"
									transition={200}
								/>
							</View>

							<View style={{ gap: 12 }}>
								<Button onPress={handleAnalyze} size="lg">
									<View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
										<Ionicons name="sparkles" size={20} color={colors.primaryForeground} />
										<Text style={{ color: colors.primaryForeground, fontSize: 18, fontWeight: '600' }}>
											Analyze
										</Text>
									</View>
								</Button>

								<Button variant="outline" onPress={() => setImageUri(null)}>
									Replace Image
								</Button>
							</View>
						</>
					) : (
						<>
							{/* Capture options */}
							<View style={{ alignItems: 'center', marginBottom: 40 }}>
								<Text style={{ fontSize: 60, marginBottom: 16 }}>🪸</Text>
								<Text style={{ color: colors.foreground, fontSize: 22, fontWeight: '600', textAlign: 'center' }}>
									Take a photo of your coral
								</Text>
								<Text style={{ color: colors.mutedForeground, fontSize: 15, textAlign: 'center', marginTop: 8 }}>
									Our AI will identify the species and assess its health
								</Text>
							</View>

							<View style={{ gap: 12 }}>
								<Button onPress={() => pickImage('camera')} size="lg">
									<View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
										<Ionicons name="camera" size={22} color={colors.primaryForeground} />
										<Text style={{ color: colors.primaryForeground, fontSize: 18, fontWeight: '600' }}>
											Take Photo
										</Text>
									</View>
								</Button>

								<Button variant="outline" onPress={() => pickImage('gallery')} size="lg">
									<View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
										<Ionicons name="images-outline" size={22} color={colors.foreground} />
										<Text style={{ color: colors.foreground, fontSize: 18, fontWeight: '600' }}>
											Choose from Library
										</Text>
									</View>
								</Button>
							</View>
						</>
					)}
				</View>
			</SafeAreaView>
		)
	}

	// ─── Analyzing Step ───────────────────────
	if (step === 'analyzing') {
		return (
			<SafeAreaView style={{ flex: 1, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }}>
				<View style={{ alignItems: 'center', gap: 24 }}>
					{imageUri ? (
						<Image
							source={{ uri: imageUri }}
							style={{ width: 200, height: 200, borderRadius: 100, opacity: 0.8 }}
							contentFit="cover"
						/>
					) : null}
					<ActivityIndicator size="large" color={colors.primary} />
					<Text style={{ color: colors.foreground, fontSize: 20, fontWeight: '600' }}>
						Analyzing coral...
					</Text>
					<Text style={{ color: colors.mutedForeground, fontSize: 15, textAlign: 'center', paddingHorizontal: 40 }}>
						Our AI is identifying the species and evaluating health indicators
					</Text>
				</View>
			</SafeAreaView>
		)
	}

	// ─── Result Step ──────────────────────────
	if (step === 'result' && result) {
		const healthColor = getHealthColor(result.healthScore)
		return (
			<SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
				<View style={{ flex: 1, padding: 16 }}>
					<View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
						{/* Score */}
						<HealthRing score={result.healthScore} size={120} strokeWidth={8} />
						<Text style={{ color: colors.foreground, fontSize: 28, fontWeight: '700', marginTop: 20, fontFamily: 'Jost-Bold' }}>
							{result.friendlyName}
						</Text>
						<Text style={{ color: colors.mutedForeground, fontSize: 16, fontStyle: 'italic', marginTop: 4 }}>
							{result.scientificName}
						</Text>

						{/* Health badge */}
						<View
							style={{
								marginTop: 16,
								paddingHorizontal: 16,
								paddingVertical: 8,
								borderRadius: 20,
								backgroundColor: healthColor + '20',
							}}
						>
							<Text style={{ color: healthColor, fontSize: 16, fontWeight: '600' }}>
								Health Score: {result.healthScore}/10
							</Text>
						</View>

						{/* Details */}
						{result.otherDetails ? (
							<Text
								style={{
									color: colors.mutedForeground,
									fontSize: 15,
									lineHeight: 22,
									textAlign: 'center',
									marginTop: 20,
									paddingHorizontal: 16,
								}}
							>
								{result.otherDetails}
							</Text>
						) : null}
					</View>

					{/* Actions */}
					<View style={{ gap: 12, paddingBottom: 16 }}>
						<Button
							onPress={() => router.replace(`/coral/${result.id}`)}
						>
							View Full Details
						</Button>
						<Button
							variant="outline"
							onPress={() => {
								setResult(null)
								setImageUri(null)
								setStep('capture')
							}}
						>
							Analyze Another
						</Button>
					</View>
				</View>
			</SafeAreaView>
		)
	}

	return null
}
