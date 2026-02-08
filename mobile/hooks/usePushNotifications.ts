import { useEffect, useRef } from 'react'
import { Platform } from 'react-native'
import * as Notifications from 'expo-notifications'
import * as Device from 'expo-device'
import Constants from 'expo-constants'
import { pushApi } from '../lib/api'

Notifications.setNotificationHandler({
	handleNotification: async () => ({
		shouldShowAlert: true,
		shouldPlaySound: true,
		shouldSetBadge: true,
	}),
})

async function registerForPushNotificationsAsync(): Promise<string | null> {
	if (!Device.isDevice) {
		// Push notifications only work on physical devices
		return null
	}

	const { status: existingStatus } = await Notifications.getPermissionsAsync()
	let finalStatus = existingStatus

	if (existingStatus !== 'granted') {
		const { status } = await Notifications.requestPermissionsAsync()
		finalStatus = status
	}

	if (finalStatus !== 'granted') {
		return null
	}

	// Get the Expo push token
	const projectId = Constants.expoConfig?.extra?.eas?.projectId
	const tokenData = await Notifications.getExpoPushTokenAsync({
		projectId,
	})

	// Android notification channel
	if (Platform.OS === 'android') {
		await Notifications.setNotificationChannelAsync('default', {
			name: 'Default',
			importance: Notifications.AndroidImportance.MAX,
			vibrationPattern: [0, 250, 250, 250],
		})
	}

	return tokenData.data
}

/**
 * Hook that handles push notification registration and listeners.
 * Call this once in the root layout when the user is authenticated.
 */
export function usePushNotifications(isAuthenticated: boolean) {
	const notificationListener = useRef<Notifications.Subscription>()
	const responseListener = useRef<Notifications.Subscription>()

	useEffect(() => {
		if (!isAuthenticated) return

		registerForPushNotificationsAsync().then((token) => {
			if (token) {
				const platform = Platform.OS === 'ios' ? 'ios' : 'android'
				pushApi.register({ token, platform: platform as 'ios' | 'android' }).catch(console.error)
			}
		})

		notificationListener.current = Notifications.addNotificationReceivedListener((_notification) => {
			// Handle foreground notification — can update badges, query invalidation, etc.
		})

		responseListener.current = Notifications.addNotificationResponseReceivedListener((_response) => {
			// Handle notification tap — navigate to relevant screen
			// const data = response.notification.request.content.data
		})

		return () => {
			if (notificationListener.current) {
				Notifications.removeNotificationSubscription(notificationListener.current)
			}
			if (responseListener.current) {
				Notifications.removeNotificationSubscription(responseListener.current)
			}
		}
	}, [isAuthenticated])
}
