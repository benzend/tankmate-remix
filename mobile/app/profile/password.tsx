import { useState } from 'react'
import { View, Text, ScrollView, Alert } from 'react-native'
import { useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useChangePassword } from '../../hooks/useUser'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { useToast } from '../../components/ui/Toast'
import { colors } from '../../theme/colors'

export default function ChangePasswordScreen() {
	const router = useRouter()
	const changePassword = useChangePassword()
	const toast = useToast()

	const [currentPassword, setCurrentPassword] = useState('')
	const [newPassword, setNewPassword] = useState('')
	const [confirmPassword, setConfirmPassword] = useState('')

	const handleSubmit = async () => {
		if (!currentPassword.trim()) {
			Alert.alert('Validation', 'Current password is required.')
			return
		}
		if (newPassword.length < 8) {
			Alert.alert('Validation', 'New password must be at least 8 characters.')
			return
		}
		if (newPassword !== confirmPassword) {
			Alert.alert('Validation', 'Passwords do not match.')
			return
		}

		try {
			await changePassword.mutateAsync({
				currentPassword,
				newPassword,
			})
			toast.success('Password changed successfully')
			router.back()
		} catch (error: any) {
			toast.error(error?.data?.error || 'Failed to change password')
		}
	}

	return (
		<SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
			{/* Header */}
			<View
				style={{
					flexDirection: 'row',
					alignItems: 'center',
					justifyContent: 'space-between',
					paddingHorizontal: 16,
					paddingVertical: 12,
					borderBottomWidth: 1,
					borderBottomColor: colors.border,
				}}
			>
				<Button variant="ghost" size="sm" onPress={() => router.back()}>
					<View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
						<Ionicons name="arrow-back" size={20} color={colors.foreground} />
						<Text style={{ color: colors.foreground, fontSize: 16 }}>Back</Text>
					</View>
				</Button>
				<Text style={{ color: colors.foreground, fontSize: 17, fontWeight: '600' }}>
					Change Password
				</Text>
				<View style={{ width: 70 }} />
			</View>

			<ScrollView
				contentContainerStyle={{ padding: 16 }}
				keyboardShouldPersistTaps="handled"
			>
				<View style={{ gap: 20 }}>
					<Input
						label="Current Password"
						value={currentPassword}
						onChangeText={setCurrentPassword}
						placeholder="Enter current password"
						secureTextEntry
						autoComplete="current-password"
					/>

					<View style={{ height: 1, backgroundColor: colors.border, marginVertical: 4 }} />

					<Input
						label="New Password"
						value={newPassword}
						onChangeText={setNewPassword}
						placeholder="At least 8 characters"
						secureTextEntry
						autoComplete="new-password"
					/>

					<Input
						label="Confirm New Password"
						value={confirmPassword}
						onChangeText={setConfirmPassword}
						placeholder="Repeat new password"
						secureTextEntry
						autoComplete="new-password"
						error={
							confirmPassword && newPassword !== confirmPassword
								? 'Passwords do not match'
								: undefined
						}
					/>

					<Button
						onPress={handleSubmit}
						isLoading={changePassword.isPending}
						style={{ marginTop: 8 }}
					>
						Update Password
					</Button>
				</View>
			</ScrollView>
		</SafeAreaView>
	)
}
