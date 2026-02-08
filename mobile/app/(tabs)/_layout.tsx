import { Tabs } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import * as Haptics from 'expo-haptics'
import { colors } from '../../theme/colors'

/**
 * Main app tab bar — replaces the web app's sidebar navigation.
 * 4 tabs: Dashboard, Coral Analyzer, Galleries, Settings.
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
			<Tabs.Screen
				name="coral"
				options={{
					title: 'Coral',
					tabBarAccessibilityLabel: 'Coral analyzer tab — analyze coral health',
					tabBarIcon: ({ color, size }) => (
						<Ionicons name="scan-outline" size={size} color={color} />
					),
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
