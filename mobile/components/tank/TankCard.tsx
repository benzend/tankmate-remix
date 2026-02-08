import { View, Text, Pressable, Dimensions } from 'react-native'
import { Image } from 'expo-image'
import { useRouter } from 'expo-router'
import { type Tank } from '../../lib/api'
import { colors } from '../../theme/colors'
import { Badge } from '../ui/Badge'
import { HealthRing } from './HealthRing'

type TankCardProps = {
	tank: Tank
}

/** Get the display image for a tank (own image or latest score image) */
function getTankImage(tank: Tank): string | null {
	if (tank.imageUrl) return tank.imageUrl
	const scoreImages = tank.fishTankScores?.map((s) => s.imageUrl).filter(Boolean) ?? []
	return scoreImages[scoreImages.length - 1] ?? null
}

/** Parse latest score average from fishTankScores */
function getScore(tank: Tank): number | null {
	const scores = tank.fishTankScores ?? []
	if (!scores.length) return null
	const last = scores[scores.length - 1]
	if (!last?.result) return null
	try {
		const parsed = JSON.parse(last.result)
		if (Array.isArray(parsed)) {
			const numericScores = parsed.map((s: any) => s.score).filter((s: any) => typeof s === 'number')
			if (numericScores.length === 0) return null
			return numericScores.reduce((a: number, b: number) => a + b, 0) / numericScores.length
		}
	} catch {
		return null
	}
	return null
}

const CARD_WIDTH = (Dimensions.get('window').width - 48) / 2

export function TankCard({ tank }: TankCardProps) {
	const router = useRouter()
	const image = getTankImage(tank)
	const score = getScore(tank)

	return (
		<Pressable
			onPress={() => router.push(`/tank/${tank.id}`)}
			accessibilityRole="button"
			accessibilityLabel={`${tank.name}, ${tank.waterType}${tank.volume ? `, ${tank.volume} gallons` : ''}`}
			style={({ pressed }) => ({
				width: CARD_WIDTH,
				borderRadius: 12,
				overflow: 'hidden',
				borderWidth: 1,
				borderColor: colors.border,
				backgroundColor: colors.card,
				transform: [{ scale: pressed ? 0.97 : 1 }],
			})}
		>
			{/* Image */}
			{image ? (
				<Image
					source={{ uri: image }}
					style={{ width: '100%', height: 120 }}
					contentFit="cover"
					placeholder={{ blurhash: 'L6PZfSi_.AyE_3t7t7R**0o#DgR4' }}
					transition={200}
				/>
			) : (
				<View
					style={{
						width: '100%',
						height: 120,
						backgroundColor: colors.accent,
						alignItems: 'center',
						justifyContent: 'center',
					}}
				>
					<Text style={{ fontSize: 40 }}>🐠</Text>
				</View>
			)}

			{/* Score overlay */}
			{score !== null ? (
				<View style={{ position: 'absolute', top: 8, right: 8 }}>
					<HealthRing score={score} size={40} strokeWidth={3} />
				</View>
			) : null}

			{/* Info */}
			<View style={{ padding: 12 }}>
				<Text
					style={{
						color: colors.foreground,
						fontSize: 16,
						fontWeight: '600',
						marginBottom: 4,
					}}
					numberOfLines={1}
				>
					{tank.name}
				</Text>
				<View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
					<Badge variant={tank.waterType === 'saltwater' ? 'default' : 'outline'}>
						{tank.waterType === 'saltwater' ? 'Salt' : 'Fresh'}
					</Badge>
					{tank.volume ? (
						<Text style={{ color: colors.mutedForeground, fontSize: 12 }}>
							{tank.volume} gal
						</Text>
					) : null}
				</View>
			</View>
		</Pressable>
	)
}
