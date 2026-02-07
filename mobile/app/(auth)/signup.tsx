import { useState } from 'react'
import {
	View,
	Text,
	KeyboardAvoidingView,
	Platform,
	ScrollView,
	Alert,
} from 'react-native'
import { Link } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useAuth } from '../../hooks/useAuth'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { colors } from '../../theme/colors'

export default function SignupScreen() {
	const { signup, isLoading } = useAuth()
	const [form, setForm] = useState({
		email: '',
		username: '',
		name: '',
		password: '',
		confirmPassword: '',
	})
	const [errors, setErrors] = useState<Record<string, string>>({})

	const updateField = (key: string, value: string) => {
		setForm((f) => ({ ...f, [key]: value }))
		setErrors((e) => ({ ...e, [key]: '' }))
	}

	const handleSignup = async () => {
		const newErrors: Record<string, string> = {}
		if (!form.email.includes('@')) newErrors.email = 'Valid email required'
		if (form.username.length < 3) newErrors.username = 'At least 3 characters'
		if (!form.name.trim()) newErrors.name = 'Name is required'
		if (form.password.length < 8) newErrors.password = 'At least 8 characters'
		if (form.password !== form.confirmPassword) newErrors.confirmPassword = 'Passwords must match'

		if (Object.keys(newErrors).length > 0) {
			setErrors(newErrors)
			return
		}

		try {
			await signup({
				email: form.email,
				username: form.username,
				password: form.password,
				name: form.name,
			})
		} catch (error: any) {
			const message = error?.data?.error || 'Signup failed. Please try again.'
			Alert.alert('Signup Failed', message)
		}
	}

	return (
		<SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
			<KeyboardAvoidingView
				style={{ flex: 1 }}
				behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
			>
				<ScrollView
					contentContainerStyle={{
						flexGrow: 1,
						justifyContent: 'center',
						paddingHorizontal: 24,
					}}
					keyboardShouldPersistTaps="handled"
				>
					<View style={{ alignItems: 'center', marginBottom: 40 }}>
						<Text
							style={{
								fontSize: 32,
								fontWeight: '700',
								color: colors.foreground,
								fontFamily: 'Jost-Bold',
							}}
						>
							Create Account
						</Text>
						<Text style={{ color: colors.mutedForeground, fontSize: 16, marginTop: 8 }}>
							Start managing your tanks
						</Text>
					</View>

					<View style={{ gap: 14 }}>
						<Input
							label="Name"
							value={form.name}
							onChangeText={(v) => updateField('name', v)}
							autoCapitalize="words"
							error={errors.name}
						/>
						<Input
							label="Email"
							value={form.email}
							onChangeText={(v) => updateField('email', v)}
							keyboardType="email-address"
							autoCapitalize="none"
							error={errors.email}
						/>
						<Input
							label="Username"
							value={form.username}
							onChangeText={(v) => updateField('username', v)}
							autoCapitalize="none"
							autoCorrect={false}
							error={errors.username}
						/>
						<Input
							label="Password"
							value={form.password}
							onChangeText={(v) => updateField('password', v)}
							secureTextEntry
							error={errors.password}
						/>
						<Input
							label="Confirm Password"
							value={form.confirmPassword}
							onChangeText={(v) => updateField('confirmPassword', v)}
							secureTextEntry
							onSubmitEditing={handleSignup}
							error={errors.confirmPassword}
						/>

						<Button
							onPress={handleSignup}
							isLoading={isLoading}
							size="lg"
							style={{ marginTop: 8 }}
						>
							Create Account
						</Button>
					</View>

					<View
						style={{
							flexDirection: 'row',
							justifyContent: 'center',
							marginTop: 32,
							marginBottom: 24,
							gap: 4,
						}}
					>
						<Text style={{ color: colors.mutedForeground }}>
							Already have an account?
						</Text>
						<Link href="/(auth)/login">
							<Text style={{ color: colors.primary, fontWeight: '600' }}>
								Sign In
							</Text>
						</Link>
					</View>
				</ScrollView>
			</KeyboardAvoidingView>
		</SafeAreaView>
	)
}
