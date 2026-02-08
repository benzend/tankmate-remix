import { useEffect, useRef } from 'react'
import { Animated, type ViewStyle } from 'react-native'

type FadeInProps = {
	children: React.ReactNode
	delay?: number
	duration?: number
	style?: ViewStyle
}

/**
 * Wraps children in a fade-in + slide-up entrance animation.
 */
export function FadeIn({ children, delay = 0, duration = 400, style }: FadeInProps) {
	const opacity = useRef(new Animated.Value(0)).current
	const translateY = useRef(new Animated.Value(12)).current

	useEffect(() => {
		Animated.parallel([
			Animated.timing(opacity, {
				toValue: 1,
				duration,
				delay,
				useNativeDriver: true,
			}),
			Animated.timing(translateY, {
				toValue: 0,
				duration,
				delay,
				useNativeDriver: true,
			}),
		]).start()
	}, [opacity, translateY, delay, duration])

	return (
		<Animated.View style={[{ opacity, transform: [{ translateY }] }, style]}>
			{children}
		</Animated.View>
	)
}

type StaggeredListProps = {
	children: React.ReactNode[]
	staggerMs?: number
	style?: ViewStyle
}

/**
 * Staggers the entrance of each child with incrementing delays.
 */
export function StaggeredList({ children, staggerMs = 60, style }: StaggeredListProps) {
	return (
		<Animated.View style={style}>
			{children.map((child, index) => (
				<FadeIn key={index} delay={index * staggerMs}>
					{child}
				</FadeIn>
			))}
		</Animated.View>
	)
}

type ScalePressProps = {
	children: React.ReactNode
	onPress?: () => void
	style?: ViewStyle
	disabled?: boolean
}

/**
 * Pressable wrapper with scale feedback animation.
 */
export function ScalePress({ children, onPress, style, disabled }: ScalePressProps) {
	const scale = useRef(new Animated.Value(1)).current

	const handlePressIn = () => {
		Animated.spring(scale, {
			toValue: 0.95,
			useNativeDriver: true,
			damping: 15,
			stiffness: 300,
		}).start()
	}

	const handlePressOut = () => {
		Animated.spring(scale, {
			toValue: 1,
			useNativeDriver: true,
			damping: 10,
			stiffness: 200,
		}).start()
	}

	return (
		<Animated.View style={[{ transform: [{ scale }] }, style]}>
			<Animated.View>
				{/* Use a Pressable wrapper for touch handling */}
				<PressableInner
					onPress={onPress}
					onPressIn={handlePressIn}
					onPressOut={handlePressOut}
					disabled={disabled}
				>
					{children}
				</PressableInner>
			</Animated.View>
		</Animated.View>
	)
}

// Extracted to avoid circular Animated nesting issues
import { Pressable } from 'react-native'

function PressableInner({
	children,
	onPress,
	onPressIn,
	onPressOut,
	disabled,
}: {
	children: React.ReactNode
	onPress?: () => void
	onPressIn?: () => void
	onPressOut?: () => void
	disabled?: boolean
}) {
	return (
		<Pressable
			onPress={onPress}
			onPressIn={onPressIn}
			onPressOut={onPressOut}
			disabled={disabled}
		>
			{children}
		</Pressable>
	)
}
