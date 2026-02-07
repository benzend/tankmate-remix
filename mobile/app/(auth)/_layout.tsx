import { Stack } from 'expo-router'
import { colors } from '../../theme/colors'

/**
 * Auth layout — no tabs, clean stack navigation for login/signup flow.
 * Uses a gradient-style dark background matching the web's AuthLayout.
 */
export default function AuthLayout() {
	return (
		<Stack
			screenOptions={{
				headerShown: false,
				contentStyle: { backgroundColor: colors.background },
				animation: 'slide_from_right',
			}}
		/>
	)
}
