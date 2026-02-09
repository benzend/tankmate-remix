import { View, Text, type ViewStyle } from 'react-native'
import Svg, { Circle } from 'react-native-svg'
import { getHealthColor, colors } from '../../theme/colors'

type HealthRingProps = {
	score: number
	size?: number
	strokeWidth?: number
	style?: ViewStyle
}

/**
 * Circular health score indicator.
 * Score 1-10 maps to 10-100% of the ring filled.
 */
export function HealthRing({ score, size = 48, strokeWidth = 4, style }: HealthRingProps) {
	const radius = (size - strokeWidth) / 2
	const circumference = 2 * Math.PI * radius
	const progress = Math.min(Math.max(score / 10, 0), 1)
	const strokeDashoffset = circumference * (1 - progress)
	const color = getHealthColor(score)

	return (
		<View style={[{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }, style]}>
			<Svg width={size} height={size} style={{ position: 'absolute' }}>
				{/* Background ring */}
				<Circle
					cx={size / 2}
					cy={size / 2}
					r={radius}
					stroke={colors.border}
					strokeWidth={strokeWidth}
					fill="none"
				/>
				{/* Progress ring */}
				<Circle
					cx={size / 2}
					cy={size / 2}
					r={radius}
					stroke={color}
					strokeWidth={strokeWidth}
					fill="none"
					strokeDasharray={`${circumference}`}
					strokeDashoffset={strokeDashoffset}
					strokeLinecap="round"
					rotation="-90"
					origin={`${size / 2}, ${size / 2}`}
				/>
			</Svg>
			<Text
				style={{
					color: color,
					fontSize: size * 0.3,
					fontWeight: '700',
				}}
			>
				{score.toFixed(1)}
			</Text>
		</View>
	)
}
