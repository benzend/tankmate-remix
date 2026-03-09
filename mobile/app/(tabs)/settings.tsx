import { View, Text, ScrollView, Pressable, Alert, Switch } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { useAuth } from '../../hooks/useAuth'
import { useExportData, useSignOutOtherSessions, useDeleteAccount } from '../../hooks/useUser'
import { useBiometrics } from '../../hooks/useBiometrics'
import { useToast } from '../../components/ui/Toast'
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
	const signOutOthers = useSignOutOtherSessions()
	const deleteAccount = useDeleteAccount()
	const biometrics = useBiometrics()
	const toast = useToast()

	const handleExport = () => {
		exportData.mutate(undefined, {
			onSuccess: () => toast.success('Data export prepared'),
			onError: () => toast.error('Failed to export data'),
		})
	}

	const handleSignOutOthers = () => {
		Alert.alert(
			'Sign Out Other Sessions',
			'This will sign out all other devices and browsers. Your current session will remain active.',
			[
				{ text: 'Cancel', style: 'cancel' },
				{
					text: 'Sign Out Others',
					style: 'destructive',
					onPress: () => {
						signOutOthers.mutate(undefined, {
							onSuccess: (data) => {
								toast.success(`Signed out ${data.sessionsRevoked} other session(s)`)
							},
							onError: () => toast.error('Failed to sign out other sessions'),
						})
					},
				},
			],
		)
	}

	const handleDeleteAccount = () => {
		Alert.alert(
			'Delete Account',
			'This action is permanent and cannot be undone. All your tanks, parameters, coral analyses, and photos will be permanently deleted.',
			[
				{ text: 'Cancel', style: 'cancel' },
				{
					text: 'Delete My Account',
					style: 'destructive',
					onPress: () => {
						Alert.alert(
							'Are you absolutely sure?',
							'Type your username to confirm is not supported. Tap "Delete Forever" to proceed.',
							[
								{ text: 'Cancel', style: 'cancel' },
								{
									text: 'Delete Forever',
									style: 'destructive',
									onPress: () => {
										deleteAccount.mutate(undefined, {
											onSuccess: () => {
												toast.success('Account deleted')
												logout()
											},
											onError: () => toast.error('Failed to delete account'),
										})
									},
								},
							],
						)
					},
				},
			],
		)
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

				<SettingsSection title="Subscription">
					<SettingsRow
						icon="diamond-outline"
						label="Manage Subscription"
						onPress={() => router.push('/subscription')}
					/>
				</SettingsSection>

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
					<SettingsRow
						icon="link-outline"
						label="Connected Accounts"
						onPress={() => router.push('/profile/connections')}
					/>
				</SettingsSection>

				{biometrics.isAvailable ? (
					<SettingsSection title="Security">
						<View
							style={{
								flexDirection: 'row',
								alignItems: 'center',
								paddingVertical: 14,
								paddingHorizontal: 16,
							}}
						>
							<Ionicons
								name="finger-print-outline"
								size={20}
								color={colors.mutedForeground}
								style={{ marginRight: 14 }}
							/>
							<Text style={{ flex: 1, color: colors.foreground, fontSize: 16 }}>
								{biometrics.biometricType || 'Biometric'} Unlock
							</Text>
							<Switch
								value={biometrics.isEnabled}
								onValueChange={(value) => {
									if (value) {
										biometrics.enable()
									} else {
										biometrics.disable()
									}
								}}
								trackColor={{ false: colors.border, true: colors.primary }}
							/>
						</View>
					</SettingsSection>
				) : null}

				<SettingsSection title="Data">
					<SettingsRow
						icon="download-outline"
						label="Export My Data"
						onPress={handleExport}
					/>
				</SettingsSection>

				<SettingsSection title="Session">
					<SettingsRow
						icon="phone-portrait-outline"
						label="Sign Out Other Sessions"
						onPress={handleSignOutOthers}
					/>
					<SettingsRow
						icon="log-out-outline"
						label="Sign Out"
						onPress={handleLogout}
						destructive
					/>
				</SettingsSection>

				<SettingsSection title="Danger Zone">
					<SettingsRow
						icon="trash-outline"
						label="Delete Account"
						onPress={handleDeleteAccount}
						destructive
					/>
				</SettingsSection>

				<View style={{ height: 40 }} />
			</ScrollView>
		</SafeAreaView>
	)
}
