import { useEffect, useRef } from 'react'
import { Animated, type ViewStyle } from 'react-native'
import { colors } from '../../theme/colors'

type SkeletonProps = {
	width: number | string
	height: number
	borderRadius?: number
	style?: ViewStyle
}

export function Skeleton({ width, height, borderRadius = 8, style }: SkeletonProps) {
	const opacity = useRef(new Animated.Value(0.3)).current

	useEffect(() => {
		const animation = Animated.loop(
			Animated.sequence([
				Animated.timing(opacity, {
					toValue: 0.7,
					duration: 800,
					useNativeDriver: true,
				}),
				Animated.timing(opacity, {
					toValue: 0.3,
					duration: 800,
					useNativeDriver: true,
				}),
			]),
		)
		animation.start()
		return () => animation.stop()
	}, [opacity])

	return (
		<Animated.View
			style={[
				{
					width: width as any,
					height,
					borderRadius,
					backgroundColor: colors.muted,
					opacity,
				},
				style,
			]}
		/>
	)
}
