import { View, Text, type ViewStyle } from 'react-native'
import { colors } from '../../theme/colors'

type BadgeVariant = 'default' | 'success' | 'warning' | 'destructive' | 'outline'

type BadgeProps = {
	children: string
	variant?: BadgeVariant
	style?: ViewStyle
}

const variantStyles: Record<BadgeVariant, { bg: string; text: string; border?: string }> = {
	default: { bg: colors.accent, text: colors.foreground },
	success: { bg: '#064e3b', text: colors.positiveGreen },
	warning: { bg: '#713f12', text: colors.neutralYellow },
	destructive: { bg: '#7f1d1d', text: colors.negativeRed },
	outline: { bg: 'transparent', text: colors.foreground, border: colors.border },
}

export function Badge({ children, variant = 'default', style }: BadgeProps) {
	const v = variantStyles[variant]
	return (
		<View
			style={[
				{
					backgroundColor: v.bg,
					paddingHorizontal: 8,
					paddingVertical: 3,
					borderRadius: 9999,
					alignSelf: 'flex-start',
					borderWidth: v.border ? 1 : 0,
					borderColor: v.border,
				},
				style,
			]}
		>
			<Text style={{ color: v.text, fontSize: 12, fontWeight: '500' }}>
				{children}
			</Text>
		</View>
	)
}
