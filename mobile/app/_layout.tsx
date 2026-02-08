import { useEffect } from 'react'
import { Slot, useRouter, useSegments } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { QueryClientProvider } from '@tanstack/react-query'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import * as SplashScreen from 'expo-splash-screen'
import { useFonts } from 'expo-font'
import { queryClient } from '../lib/queryClient'
import { useAuth } from '../hooks/useAuth'
import { ToastProvider } from '../components/ui/Toast'
import { ErrorBoundary } from '../components/ui/ErrorBoundary'
import { usePushNotifications } from '../hooks/usePushNotifications'

// Keep splash screen visible while loading
SplashScreen.preventAutoHideAsync()

/**
 * Root layout — wraps the entire app with providers and handles
 * the auth gate (redirect to login if unauthenticated).
 */
export default function RootLayout() {
	const [fontsLoaded] = useFonts({
		Jost: require('../assets/fonts/Jost-Regular.ttf'),
		'Jost-Medium': require('../assets/fonts/Jost-Medium.ttf'),
		'Jost-Bold': require('../assets/fonts/Jost-Bold.ttf'),
		GowunBatang: require('../assets/fonts/GowunBatang-Regular.ttf'),
	})

	const { user, isLoading, restore } = useAuth()

	// Register push notifications when authenticated
	usePushNotifications(!!user)

	// Restore auth state on app launch
	useEffect(() => {
		restore()
	}, [])

	// Hide splash when ready
	useEffect(() => {
		if (!isLoading && fontsLoaded) {
			SplashScreen.hideAsync()
		}
	}, [isLoading, fontsLoaded])

	if (isLoading || !fontsLoaded) {
		return null // Splash screen is showing
	}

	return (
		<GestureHandlerRootView style={{ flex: 1 }}>
			<ErrorBoundary>
				<QueryClientProvider client={queryClient}>
					<ToastProvider>
						<StatusBar style="light" />
						<AuthGate user={user} />
					</ToastProvider>
				</QueryClientProvider>
			</ErrorBoundary>
		</GestureHandlerRootView>
	)
}

/**
 * Redirects to auth screens if not logged in, or to tabs if logged in.
 */
function AuthGate({ user }: { user: any }) {
	const segments = useSegments()
	const router = useRouter()

	useEffect(() => {
		const inAuthGroup = segments[0] === '(auth)'
		if (!user && !inAuthGroup) {
			// Not logged in, redirect to login
			router.replace('/(auth)/login')
		} else if (user && inAuthGroup) {
			// Logged in but on auth screen, redirect to dashboard
			router.replace('/(tabs)')
		}
	}, [user, segments])

	return <Slot />
}
