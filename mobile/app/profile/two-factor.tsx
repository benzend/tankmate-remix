import { View, Text, ScrollView } from 'react-native'
import { useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { Button } from '../../components/ui/Button'
import { Card, CardContent } from '../../components/ui/Card'
import { colors } from '../../theme/colors'

export default function TwoFactorScreen() {
	const router = useRouter()

	// 2FA setup requires QR code scanning which needs the web app.
	// This screen explains the situation and links to the web for setup.

	return (
		<SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
			{/* Header */}
			<View
				style={{
					flexDirection: 'row',
					alignItems: 'center',
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
				<Text style={{ color: colors.foreground, fontSize: 17, fontWeight: '600', marginLeft: 8 }}>
					Two-Factor Authentication
				</Text>
			</View>

			<ScrollView contentContainerStyle={{ padding: 16 }}>
				<View style={{ alignItems: 'center', marginVertical: 32 }}>
					<View
						style={{
							width: 80,
							height: 80,
							borderRadius: 40,
							backgroundColor: colors.accent,
							alignItems: 'center',
							justifyContent: 'center',
							marginBottom: 16,
						}}
					>
						<Ionicons name="shield-checkmark" size={40} color={colors.chart.alk} />
					</View>
					<Text style={{ color: colors.foreground, fontSize: 22, fontWeight: '600', textAlign: 'center' }}>
						Secure Your Account
					</Text>
					<Text style={{ color: colors.mutedForeground, fontSize: 15, textAlign: 'center', marginTop: 8, paddingHorizontal: 16 }}>
						Two-factor authentication adds an extra layer of security using a TOTP authenticator app.
					</Text>
				</View>

				<Card>
					<CardContent>
						<View style={{ gap: 16 }}>
							<View style={{ flexDirection: 'row', gap: 12, alignItems: 'flex-start' }}>
								<View
									style={{
										width: 28,
										height: 28,
										borderRadius: 14,
										backgroundColor: colors.chart.pH + '20',
										alignItems: 'center',
										justifyContent: 'center',
									}}
								>
									<Text style={{ color: colors.chart.pH, fontSize: 14, fontWeight: '700' }}>1</Text>
								</View>
								<View style={{ flex: 1 }}>
									<Text style={{ color: colors.foreground, fontSize: 15, fontWeight: '500' }}>
										Open TankMate on your browser
									</Text>
									<Text style={{ color: colors.mutedForeground, fontSize: 13, marginTop: 2 }}>
										Go to Settings → Two-Factor Auth
									</Text>
								</View>
							</View>

							<View style={{ flexDirection: 'row', gap: 12, alignItems: 'flex-start' }}>
								<View
									style={{
										width: 28,
										height: 28,
										borderRadius: 14,
										backgroundColor: colors.chart.pH + '20',
										alignItems: 'center',
										justifyContent: 'center',
									}}
								>
									<Text style={{ color: colors.chart.pH, fontSize: 14, fontWeight: '700' }}>2</Text>
								</View>
								<View style={{ flex: 1 }}>
									<Text style={{ color: colors.foreground, fontSize: 15, fontWeight: '500' }}>
										Scan the QR code
									</Text>
									<Text style={{ color: colors.mutedForeground, fontSize: 13, marginTop: 2 }}>
										Use Google Authenticator, Authy, or any TOTP app
									</Text>
								</View>
							</View>

							<View style={{ flexDirection: 'row', gap: 12, alignItems: 'flex-start' }}>
								<View
									style={{
										width: 28,
										height: 28,
										borderRadius: 14,
										backgroundColor: colors.chart.pH + '20',
										alignItems: 'center',
										justifyContent: 'center',
									}}
								>
									<Text style={{ color: colors.chart.pH, fontSize: 14, fontWeight: '700' }}>3</Text>
								</View>
								<View style={{ flex: 1 }}>
									<Text style={{ color: colors.foreground, fontSize: 15, fontWeight: '500' }}>
										Save recovery codes
									</Text>
									<Text style={{ color: colors.mutedForeground, fontSize: 13, marginTop: 2 }}>
										Store them somewhere safe in case you lose your device
									</Text>
								</View>
							</View>
						</View>
					</CardContent>
				</Card>

				<Text style={{ color: colors.mutedForeground, fontSize: 13, textAlign: 'center', marginTop: 24 }}>
					Once enabled on the web, 2FA will also protect your mobile sessions.
				</Text>
			</ScrollView>
		</SafeAreaView>
	)
}
