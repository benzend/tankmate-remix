import { Ionicons } from '@expo/vector-icons'
import { Component, type ErrorInfo, type ReactNode } from 'react'
import { View, Text, Pressable } from 'react-native'
import { colors } from '../../theme/colors'

type Props = {
	children: ReactNode
	fallback?: ReactNode
}

type State = {
	hasError: boolean
	error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
	constructor(props: Props) {
		super(props)
		this.state = { hasError: false, error: null }
	}

	static getDerivedStateFromError(error: Error): State {
		return { hasError: true, error }
	}

	componentDidCatch(error: Error, info: ErrorInfo) {
		console.error('ErrorBoundary caught:', error, info.componentStack)
	}

	resetError = () => {
		this.setState({ hasError: false, error: null })
	}

	render() {
		if (this.state.hasError) {
			if (this.props.fallback) return this.props.fallback

			return (
				<View
					style={{
						flex: 1,
						backgroundColor: colors.background,
						justifyContent: 'center',
						alignItems: 'center',
						padding: 32,
					}}
				>
					<View
						style={{
							width: 64,
							height: 64,
							borderRadius: 32,
							backgroundColor: colors.destructive + '30',
							alignItems: 'center',
							justifyContent: 'center',
							marginBottom: 20,
						}}
					>
						<Ionicons name="warning" size={32} color={colors.negativeRed} />
					</View>
					<Text
						style={{
							color: colors.foreground,
							fontSize: 20,
							fontWeight: '600',
							marginBottom: 8,
							textAlign: 'center',
						}}
					>
						Something went wrong
					</Text>
					<Text
						style={{
							color: colors.mutedForeground,
							fontSize: 15,
							textAlign: 'center',
							marginBottom: 24,
							lineHeight: 22,
						}}
					>
						An unexpected error occurred. Please try again.
					</Text>
					<Pressable
						onPress={this.resetError}
						style={({ pressed }) => ({
							backgroundColor: colors.primary,
							paddingHorizontal: 24,
							paddingVertical: 12,
							borderRadius: 8,
							opacity: pressed ? 0.8 : 1,
						})}
					>
						<Text style={{ color: colors.primaryForeground, fontSize: 16, fontWeight: '600' }}>
							Try Again
						</Text>
					</Pressable>
				</View>
			)
		}

		return this.props.children
	}
}
