import { useEffect } from 'react'
import { Slot, useRouter, useSegments } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import * as SplashScreen from 'expo-splash-screen'
import { useFonts } from 'expo-font'
import { queryClient, asyncStoragePersister } from '../lib/queryClient'
import { useAuth } from '../hooks/useAuth'
import { ToastProvider } from '../components/ui/Toast'
import { ErrorBoundary } from '../components/ui/ErrorBoundary'
import { usePushNotifications } from '../hooks/usePushNotifications'
import { useBiometrics } from '../hooks/useBiometrics'

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
	const { authenticate, isEnabled } = useBiometrics()

	// Register push notifications when authenticated
	usePushNotifications(!!user)

	// Restore auth state on app launch (with optional biometric gate)
	useEffect(() => {
		const init = async () => {
			if (isEnabled) {
				const passed = await authenticate()
				if (!passed) {
					// User cancelled biometric — still attempt restore
					// (they'll see the login screen if token is missing)
				}
			}
			restore()
		}
		init()
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
				<PersistQueryClientProvider
					client={queryClient}
					persistOptions={{ persister: asyncStoragePersister, maxAge: 7 * 24 * 60 * 60 * 1000 }}
				>
					<ToastProvider>
						<StatusBar style="light" />
						<AuthGate user={user} />
					</ToastProvider>
				</PersistQueryClientProvider>
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
