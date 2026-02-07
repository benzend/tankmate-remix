import { forwardRef, useState } from 'react'
import {
	TextInput,
	View,
	Text,
	type TextInputProps,
	type ViewStyle,
} from 'react-native'
import { colors } from '../../theme/colors'

type InputProps = TextInputProps & {
	label?: string
	error?: string
	containerStyle?: ViewStyle
}

export const Input = forwardRef<TextInput, InputProps>(
	({ label, error, containerStyle, style, ...props }, ref) => {
		const [isFocused, setIsFocused] = useState(false)

		return (
			<View style={containerStyle}>
				{label ? (
					<Text
						style={{
							color: colors.foreground,
							fontSize: 14,
							fontWeight: '500',
							marginBottom: 6,
						}}
					>
						{label}
					</Text>
				) : null}
				<TextInput
					ref={ref}
					placeholderTextColor={colors.mutedForeground}
					onFocus={(e) => {
						setIsFocused(true)
						props.onFocus?.(e)
					}}
					onBlur={(e) => {
						setIsFocused(false)
						props.onBlur?.(e)
					}}
					style={[
						{
							backgroundColor: colors.accent,
							borderWidth: 1,
							borderColor: error
								? '#dc2626'
								: isFocused
									? colors.ring
									: colors.border,
							borderRadius: 8,
							paddingHorizontal: 14,
							paddingVertical: 12,
							fontSize: 16,
							color: colors.foreground,
							minHeight: 44,
						},
						style,
					]}
					{...props}
				/>
				{error ? (
					<Text
						style={{
							color: '#dc2626',
							fontSize: 12,
							marginTop: 4,
						}}
					>
						{error}
					</Text>
				) : null}
			</View>
		)
	},
)

Input.displayName = 'Input'
