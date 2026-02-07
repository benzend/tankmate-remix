import { View, Text, ScrollView, Pressable, Alert } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { useAuth } from '../../hooks/useAuth'
import { useExportData } from '../../hooks/useUser'
import { colors } from '../../theme/colors'

type SettingsRowProps = {
	icon: keyof typeof Ionicons.glyphMap
	label: string
	onPress: () => void
	destructive?: boolean
}

function SettingsRow({ icon, label, onPress, destructive }: SettingsRowProps) {
	return (
		<Pressable
			onPress={onPress}
			style={({ pressed }) => ({
				flexDirection: 'row',
				alignItems: 'center',
				paddingVertical: 14,
				paddingHorizontal: 16,
				backgroundColor: pressed ? colors.accent : 'transparent',
				borderRadius: 8,
			})}
		>
			<Ionicons
				name={icon}
				size={20}
				color={destructive ? colors.negativeRed : colors.mutedForeground}
				style={{ marginRight: 14 }}
			/>
			<Text
				style={{
					flex: 1,
					color: destructive ? colors.negativeRed : colors.foreground,
					fontSize: 16,
				}}
			>
				{label}
			</Text>
			<Ionicons name="chevron-forward" size={18} color={colors.mutedForeground} />
		</Pressable>
	)
}

function SettingsSection({ title, children }: { title: string; children: React.ReactNode }) {
	return (
		<View style={{ marginBottom: 24 }}>
			<Text
				style={{
					color: colors.mutedForeground,
					fontSize: 13,
					fontWeight: '600',
					textTransform: 'uppercase',
					marginBottom: 8,
					paddingHorizontal: 16,
				}}
			>
				{title}
			</Text>
			<View
				style={{
					backgroundColor: colors.card,
					borderRadius: 12,
					borderWidth: 1,
					borderColor: colors.border,
					overflow: 'hidden',
				}}
			>
				{children}
			</View>
		</View>
	)
}

export default function SettingsScreen() {
	const router = useRouter()
	const { user, logout } = useAuth()
	const exportData = useExportData()

	const handleExport = () => {
		exportData.mutate(undefined, {
			onSuccess: () => Alert.alert('Export', 'Your data export has been prepared.'),
			onError: () => Alert.alert('Error', 'Failed to export data. Please try again.'),
		})
	}

	const handleLogout = () => {
		Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
			{ text: 'Cancel', style: 'cancel' },
			{
				text: 'Sign Out',
				style: 'destructive',
				onPress: logout,
			},
		])
	}

	return (
		<SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>
			<ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16 }}>
				{/* User header */}
				<View style={{ alignItems: 'center', marginBottom: 32 }}>
					<View
						style={{
							width: 80,
							height: 80,
							borderRadius: 40,
							backgroundColor: colors.accent,
							alignItems: 'center',
							justifyContent: 'center',
							marginBottom: 12,
						}}
					>
						<Text style={{ fontSize: 32 }}>
							{user?.name?.[0]?.toUpperCase() || user?.username?.[0]?.toUpperCase() || '?'}
						</Text>
					</View>
					<Text style={{ color: colors.foreground, fontSize: 22, fontWeight: '600' }}>
						{user?.name || user?.username}
					</Text>
					<Text style={{ color: colors.mutedForeground, fontSize: 14 }}>
						@{user?.username}
					</Text>
				</View>

				<SettingsSection title="Account">
					<SettingsRow
						icon="person-outline"
						label="Edit Profile"
						onPress={() => router.push('/profile/edit')}
					/>
					<SettingsRow
						icon="lock-closed-outline"
						label="Change Password"
						onPress={() => router.push('/profile/password')}
					/>
					<SettingsRow
						icon="shield-checkmark-outline"
						label="Two-Factor Auth"
						onPress={() => router.push('/profile/two-factor')}
					/>
				</SettingsSection>

				<SettingsSection title="Data">
					<SettingsRow
						icon="download-outline"
						label="Export My Data"
						onPress={handleExport}
					/>
				</SettingsSection>

				<SettingsSection title="Session">
					<SettingsRow
						icon="log-out-outline"
						label="Sign Out"
						onPress={handleLogout}
						destructive
					/>
				</SettingsSection>
			</ScrollView>
		</SafeAreaView>
	)
}
