import { Ionicons } from '@expo/vector-icons'
import * as Haptics from 'expo-haptics'
import { createContext, useCallback, useContext, useRef, useState } from 'react'
import { Animated, Text, View, Pressable } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { colors } from '../../theme/colors'

type ToastType = 'success' | 'error' | 'info'

type ToastConfig = {
	message: string
	type?: ToastType
	duration?: number
}

type ToastContextValue = {
	show: (config: ToastConfig) => void
	success: (message: string) => void
	error: (message: string) => void
	info: (message: string) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

const TOAST_STYLES: Record<ToastType, { bg: string; icon: keyof typeof Ionicons.glyphMap; iconColor: string }> = {
	success: { bg: '#065f46', icon: 'checkmark-circle', iconColor: colors.positiveGreen },
	error: { bg: '#7f1d1d', icon: 'alert-circle', iconColor: colors.negativeRed },
	info: { bg: '#1e3a5f', icon: 'information-circle', iconColor: colors.chart.pH },
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
	const insets = useSafeAreaInsets()
	const [toast, setToast] = useState<ToastConfig | null>(null)
	const translateY = useRef(new Animated.Value(-100)).current
	const opacity = useRef(new Animated.Value(0)).current
	const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

	const hide = useCallback(() => {
		Animated.parallel([
			Animated.timing(translateY, { toValue: -100, duration: 250, useNativeDriver: true }),
			Animated.timing(opacity, { toValue: 0, duration: 250, useNativeDriver: true }),
		]).start(() => setToast(null))
	}, [translateY, opacity])

	const show = useCallback(
		(config: ToastConfig) => {
			if (timeoutRef.current) clearTimeout(timeoutRef.current)

			setToast(config)
			translateY.setValue(-100)
			opacity.setValue(0)

			Haptics.notificationAsync(
				config.type === 'error'
					? Haptics.NotificationFeedbackType.Error
					: Haptics.NotificationFeedbackType.Success,
			)

			Animated.parallel([
				Animated.spring(translateY, { toValue: 0, useNativeDriver: true, damping: 15, stiffness: 150 }),
				Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }),
			]).start()

			timeoutRef.current = setTimeout(hide, config.duration || 3000)
		},
		[translateY, opacity, hide],
	)

	const contextValue: ToastContextValue = {
		show,
		success: (message) => show({ message, type: 'success' }),
		error: (message) => show({ message, type: 'error' }),
		info: (message) => show({ message, type: 'info' }),
	}

	const style = toast ? TOAST_STYLES[toast.type || 'info'] : TOAST_STYLES.info

	return (
		<ToastContext.Provider value={contextValue}>
			{children}
			{toast ? (
				<Animated.View
					style={{
						position: 'absolute',
						top: insets.top + 8,
						left: 16,
						right: 16,
						zIndex: 9999,
						transform: [{ translateY }],
						opacity,
					}}
				>
					<Pressable onPress={hide}>
						<View
							style={{
								backgroundColor: style.bg,
								borderRadius: 12,
								paddingHorizontal: 16,
								paddingVertical: 14,
								flexDirection: 'row',
								alignItems: 'center',
								gap: 10,
								shadowColor: '#000',
								shadowOffset: { width: 0, height: 4 },
								shadowOpacity: 0.3,
								shadowRadius: 8,
								elevation: 8,
							}}
						>
							<Ionicons name={style.icon} size={22} color={style.iconColor} />
							<Text
								style={{
									flex: 1,
									color: colors.foreground,
									fontSize: 15,
									fontWeight: '500',
								}}
								numberOfLines={2}
							>
								{toast.message}
							</Text>
							<Ionicons name="close" size={18} color={colors.mutedForeground} />
						</View>
					</Pressable>
				</Animated.View>
			) : null}
		</ToastContext.Provider>
	)
}

export function useToast(): ToastContextValue {
	const ctx = useContext(ToastContext)
	if (!ctx) throw new Error('useToast must be used within ToastProvider')
	return ctx
}
