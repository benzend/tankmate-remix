import { Ionicons } from '@expo/vector-icons'
import * as Haptics from 'expo-haptics'
import { Tabs } from 'expo-router'
import { colors } from '../../theme/colors'

/**
 * Main app tab bar — replaces the web app's sidebar navigation.
 * 3 tabs: Dashboard, Galleries, Settings.
 * Coral Analyzer is temporarily hidden until the backend API is wired up.
 */
export default function TabLayout() {
	return (
		<Tabs
			screenOptions={{
				headerStyle: { backgroundColor: colors.background },
				headerTintColor: colors.foreground,
				headerTitleStyle: { fontFamily: 'Jost-Medium' },
				headerShown: false,
				tabBarStyle: {
					backgroundColor: colors.background,
					borderTopColor: colors.border,
					borderTopWidth: 1,
					height: 88,
					paddingBottom: 28,
					paddingTop: 8,
				},
				tabBarActiveTintColor: colors.primary,
				tabBarInactiveTintColor: colors.mutedForeground,
				tabBarLabelStyle: {
					fontSize: 12,
					fontFamily: 'Jost',
				},
			}}
			screenListeners={{
				tabPress: () => {
					Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
				},
			}}
		>
			<Tabs.Screen
				name="index"
				options={{
					title: 'Dashboard',
					tabBarAccessibilityLabel: 'Dashboard tab — view your tanks',
					tabBarIcon: ({ color, size }) => (
						<Ionicons name="fish-outline" size={size} color={color} />
					),
				}}
			/>
			{/* Coral analyzer — temporarily hidden until backend API is wired up */}
			<Tabs.Screen
				name="coral"
				options={{
					href: null,
				}}
			/>
			<Tabs.Screen
				name="galleries"
				options={{
					title: 'Gallery',
					tabBarAccessibilityLabel: 'Gallery tab — view tank photos',
					tabBarIcon: ({ color, size }) => (
						<Ionicons name="images-outline" size={size} color={color} />
					),
				}}
			/>
			<Tabs.Screen
				name="settings"
				options={{
					title: 'Settings',
					tabBarAccessibilityLabel: 'Settings tab — manage your account',
					tabBarIcon: ({ color, size }) => (
						<Ionicons name="settings-outline" size={size} color={color} />
					),
				}}
			/>
		</Tabs>
	)
}
