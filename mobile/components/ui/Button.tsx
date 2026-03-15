import * as Haptics from 'expo-haptics'
import { forwardRef } from 'react'
import {
	Pressable,
	Text,
	ActivityIndicator,
	type PressableProps,
	type ViewStyle,
	type TextStyle,
} from 'react-native'
import { colors } from '../../theme/colors'

type ButtonVariant = 'default' | 'destructive' | 'outline' | 'ghost'
type ButtonSize = 'default' | 'sm' | 'lg' | 'icon'

type ButtonProps = PressableProps & {
	variant?: ButtonVariant
	size?: ButtonSize
	isLoading?: boolean
	children: React.ReactNode
}

const variantStyles: Record<ButtonVariant, { container: ViewStyle; text: TextStyle }> = {
	default: {
		container: { backgroundColor: colors.primary },
		text: { color: colors.primaryForeground },
	},
	destructive: {
		container: { backgroundColor: '#dc2626' },
		text: { color: '#ffffff' },
	},
	outline: {
		container: {
			backgroundColor: 'transparent',
			borderWidth: 1,
			borderColor: colors.border,
		},
		text: { color: colors.foreground },
	},
	ghost: {
		container: { backgroundColor: 'transparent' },
		text: { color: colors.foreground },
	},
}

const sizeStyles: Record<ButtonSize, { container: ViewStyle; text: TextStyle }> = {
	default: {
		container: { paddingHorizontal: 16, paddingVertical: 12, borderRadius: 8 },
		text: { fontSize: 16, fontWeight: '600' },
	},
	sm: {
		container: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 6 },
		text: { fontSize: 14, fontWeight: '500' },
	},
	lg: {
		container: { paddingHorizontal: 24, paddingVertical: 16, borderRadius: 10 },
		text: { fontSize: 18, fontWeight: '600' },
	},
	icon: {
		container: {
			width: 44,
			height: 44,
			borderRadius: 8,
			alignItems: 'center',
			justifyContent: 'center',
		},
		text: { fontSize: 16 },
	},
}

export const Button = forwardRef<any, ButtonProps>(
	({ variant = 'default', size = 'default', isLoading, children, style, onPress, disabled, ...props }, ref) => {
		const variantStyle = variantStyles[variant]
		const sizeStyle = sizeStyles[size]

		const handlePress = async (e: any) => {
			await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
			onPress?.(e)
		}

		return (
			<Pressable
				ref={ref}
				onPress={handlePress}
				disabled={disabled || isLoading}
				style={({ pressed }) => [
					{
						flexDirection: 'row',
						alignItems: 'center',
						justifyContent: 'center',
						minHeight: 44,
						opacity: disabled || isLoading ? 0.5 : pressed ? 0.8 : 1,
					},
					variantStyle.container,
					sizeStyle.container,
					style as ViewStyle,
				]}
				{...props}
			>
				{isLoading ? (
					<ActivityIndicator
						size="small"
						color={variantStyle.text.color}
						style={{ marginRight: 8 }}
					/>
				) : null}
				{typeof children === 'string' ? (
					<Text style={[variantStyle.text, sizeStyle.text]}>{children}</Text>
				) : (
					children
				)}
			</Pressable>
		)
	},
)

Button.displayName = 'Button'
