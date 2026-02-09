import { View, Text, Pressable, type ViewStyle } from 'react-native'
import { colors } from '../../theme/colors'

type CardProps = {
	children: React.ReactNode
	style?: ViewStyle
	onPress?: () => void
}

export function Card({ children, style, onPress }: CardProps) {
	const Wrapper = onPress ? Pressable : View

	return (
		<Wrapper
			onPress={onPress}
			style={({ pressed }: any) => [
				{
					backgroundColor: colors.card,
					borderWidth: 1,
					borderColor: colors.border,
					borderRadius: 12,
					overflow: 'hidden',
					opacity: pressed && onPress ? 0.9 : 1,
				},
				style,
			]}
		>
			{children}
		</Wrapper>
	)
}

export function CardHeader({ children, style }: { children: React.ReactNode; style?: ViewStyle }) {
	return (
		<View style={[{ padding: 16, borderBottomWidth: 1, borderBottomColor: colors.border }, style]}>
			{children}
		</View>
	)
}

export function CardContent({ children, style }: { children: React.ReactNode; style?: ViewStyle }) {
	return <View style={[{ padding: 16 }, style]}>{children}</View>
}

export function CardTitle({ children }: { children: string }) {
	return (
		<Text style={{ color: colors.foreground, fontSize: 18, fontWeight: '600' }}>
			{children}
		</Text>
	)
}
