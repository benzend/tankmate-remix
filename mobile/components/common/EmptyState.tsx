import { View, Text } from 'react-native'
import { colors } from '../../theme/colors'
import { Button } from '../ui/Button'

type EmptyStateProps = {
	icon?: string
	title: string
	description?: string
	actionLabel?: string
	onAction?: () => void
}

export function EmptyState({ icon, title, description, actionLabel, onAction }: EmptyStateProps) {
	return (
		<View
			style={{
				alignItems: 'center',
				justifyContent: 'center',
				paddingVertical: 48,
				paddingHorizontal: 32,
			}}
		>
			{icon ? (
				<Text style={{ fontSize: 48, marginBottom: 16 }}>{icon}</Text>
			) : null}
			<Text
				style={{
					color: colors.foreground,
					fontSize: 20,
					fontWeight: '600',
					textAlign: 'center',
					marginBottom: 8,
				}}
			>
				{title}
			</Text>
			{description ? (
				<Text
					style={{
						color: colors.mutedForeground,
						fontSize: 14,
						textAlign: 'center',
						marginBottom: 24,
					}}
				>
					{description}
				</Text>
			) : null}
			{actionLabel && onAction ? (
				<Button onPress={onAction}>{actionLabel}</Button>
			) : null}
		</View>
	)
}
