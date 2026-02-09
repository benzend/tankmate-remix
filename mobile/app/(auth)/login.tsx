import { useState } from 'react'
import {
	View,
	Text,
	ScrollView,
	Alert,
} from 'react-native'
import { Link } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useAuth } from '../../hooks/useAuth'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { colors } from '../../theme/colors'

export default function LoginScreen() {
	const { login, isLoading } = useAuth()
	const [username, setUsername] = useState('')
	const [password, setPassword] = useState('')
	const [errors, setErrors] = useState<{ username?: string; password?: string }>({})

	const handleLogin = async () => {
		setErrors({})

		if (!username.trim()) {
			setErrors((e) => ({ ...e, username: 'Username is required' }))
			return
		}
		if (!password) {
			setErrors((e) => ({ ...e, password: 'Password is required' }))
			return
		}

		try {
			await login(username.trim(), password)
		} catch (error: any) {
			const message = error?.data?.error || 'Login failed. Please try again.'
			Alert.alert('Login Failed', message)
		}
	}

	return (
		<SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
				<ScrollView
					contentContainerStyle={{
						flexGrow: 1,
						justifyContent: 'center',
						paddingHorizontal: 24,
					}}
					keyboardShouldPersistTaps="handled"
					automaticallyAdjustKeyboardInsets
				>
					{/* Logo */}
					<View style={{ alignItems: 'center', marginBottom: 48 }}>
						<Text
							style={{
								fontSize: 40,
								fontWeight: '700',
								color: colors.foreground,
								fontFamily: 'Jost-Bold',
							}}
						>
							ReefChronicles
						</Text>
						<Text style={{ color: colors.mutedForeground, fontSize: 16, marginTop: 8 }}>
							Sign in to your account
						</Text>
					</View>

					{/* Form */}
					<View style={{ gap: 16 }}>
						<Input
							label="Username"
							value={username}
							onChangeText={setUsername}
							autoCapitalize="none"
							autoCorrect={false}
							returnKeyType="next"
							error={errors.username}
						/>

						<Input
							label="Password"
							value={password}
							onChangeText={setPassword}
							secureTextEntry
							returnKeyType="done"
							onSubmitEditing={handleLogin}
							error={errors.password}
						/>

						<Button
							onPress={handleLogin}
							isLoading={isLoading}
							size="lg"
							style={{ marginTop: 8 }}
						>
							Sign In
						</Button>
					</View>

					{/* Sign up link */}
					<View
						style={{
							flexDirection: 'row',
							justifyContent: 'center',
							marginTop: 32,
							gap: 4,
						}}
					>
						<Text style={{ color: colors.mutedForeground }}>
							Don't have an account?
						</Text>
						<Link href="/(auth)/signup">
							<Text style={{ color: colors.primary, fontWeight: '600' }}>
								Sign Up
							</Text>
						</Link>
					</View>
				</ScrollView>
		</SafeAreaView>
	)
}
