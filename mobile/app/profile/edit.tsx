import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { useState, useEffect } from 'react'
import { View, Text, ScrollView, Alert } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Skeleton } from '../../components/ui/Skeleton'
import { useToast } from '../../components/ui/Toast'
import { useAuth } from '../../hooks/useAuth'
import { useUserProfile, useUpdateProfile } from '../../hooks/useUser'
import { colors } from '../../theme/colors'

export default function EditProfileScreen() {
	const router = useRouter()
	const { data: profile, isLoading } = useUserProfile()
	const updateProfile = useUpdateProfile()
	const { restore } = useAuth()
	const toast = useToast()

	const [name, setName] = useState('')
	const [username, setUsername] = useState('')

	useEffect(() => {
		if (profile) {
			setName(profile.name || '')
			setUsername(profile.username || '')
		}
	}, [profile])

	const handleSave = async () => {
		if (!username.trim()) {
			Alert.alert('Validation', 'Username is required.')
			return
		}

		try {
			await updateProfile.mutateAsync({
				name: name.trim() || undefined,
				username: username.trim(),
			})
			await restore()
			toast.success('Profile updated')
			router.back()
		} catch (error: any) {
			toast.error(error?.data?.error || 'Failed to update profile')
		}
	}

	if (isLoading) {
		return (
			<SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
				<View style={{ padding: 16, gap: 16 }}>
					<Skeleton width={200} height={32} />
					<Skeleton width="100%" height={48} borderRadius={8} />
					<Skeleton width="100%" height={48} borderRadius={8} />
				</View>
			</SafeAreaView>
		)
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
						<Ionicons name="close" size={20} color={colors.foreground} />
						<Text style={{ color: colors.foreground, fontSize: 16 }}>Cancel</Text>
					</View>
				</Button>
				<Text style={{ color: colors.foreground, fontSize: 17, fontWeight: '600' }}>
					Edit Profile
				</Text>
				<Button
					size="sm"
					onPress={handleSave}
					isLoading={updateProfile.isPending}
				>
					Save
				</Button>
			</View>

			<ScrollView contentContainerStyle={{ padding: 16 }}>
				{/* Avatar */}
				<View style={{ alignItems: 'center', marginBottom: 32 }}>
					<View
						style={{
							width: 100,
							height: 100,
							borderRadius: 50,
							backgroundColor: colors.accent,
							alignItems: 'center',
							justifyContent: 'center',
							marginBottom: 8,
						}}
					>
						<Text style={{ fontSize: 40 }}>
							{name?.[0]?.toUpperCase() || username?.[0]?.toUpperCase() || '?'}
						</Text>
					</View>
					<Text style={{ color: colors.mutedForeground, fontSize: 14 }}>
						{profile?.email}
					</Text>
				</View>

				<View style={{ gap: 20 }}>
					<Input
						label="Display Name"
						value={name}
						onChangeText={setName}
						placeholder="Your name"
						autoCapitalize="words"
					/>

					<Input
						label="Username"
						value={username}
						onChangeText={setUsername}
						placeholder="username"
						autoCapitalize="none"
						autoCorrect={false}
					/>
				</View>

				<Text style={{ color: colors.mutedForeground, fontSize: 13, marginTop: 16 }}>
					Member since {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString('en-US', {
						year: 'numeric',
						month: 'long',
						day: 'numeric',
					}) : '—'}
				</Text>
			</ScrollView>
		</SafeAreaView>
	)
}
