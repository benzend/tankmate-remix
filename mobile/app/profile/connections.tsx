import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { View, Text, ScrollView } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { EmptyState } from '../../components/common/EmptyState'
import { FadeIn } from '../../components/ui/Animated'
import { Button } from '../../components/ui/Button'
import { Card, CardContent } from '../../components/ui/Card'
import { Skeleton } from '../../components/ui/Skeleton'
import { useConnections } from '../../hooks/useUser'
import { colors } from '../../theme/colors'

const PROVIDER_META: Record<string, { icon: keyof typeof Ionicons.glyphMap; label: string; color: string }> = {
	github: { icon: 'logo-github', label: 'GitHub', color: '#fff' },
	google: { icon: 'logo-google', label: 'Google', color: '#4285F4' },
	discord: { icon: 'logo-discord', label: 'Discord', color: '#5865F2' },
}

export default function ConnectionsScreen() {
	const router = useRouter()
	const { data: connections, isLoading } = useConnections()

	if (isLoading) {
		return (
			<SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
				<View style={{ padding: 16, gap: 16 }}>
					<Skeleton width={200} height={28} />
					<Skeleton width="100%" height={80} borderRadius={12} />
					<Skeleton width="100%" height={80} borderRadius={12} />
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
					Connected Accounts
				</Text>
			</View>

			<ScrollView contentContainerStyle={{ padding: 16 }}>
				{!connections?.length ? (
					<EmptyState
						icon="🔗"
						title="No connected accounts"
						description="Connect third-party accounts for easier sign-in. You can set this up from the web app."
					/>
				) : (
					<View style={{ gap: 12 }}>
						{connections.map((conn, index) => {
							const meta = PROVIDER_META[conn.providerName] || {
								icon: 'link-outline' as const,
								label: conn.providerName,
								color: colors.foreground,
							}

							return (
								<FadeIn key={conn.id} delay={index * 60}>
									<Card>
										<CardContent>
											<View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
												<View
													style={{
														width: 44,
														height: 44,
														borderRadius: 22,
														backgroundColor: colors.accent,
														alignItems: 'center',
														justifyContent: 'center',
													}}
												>
													<Ionicons name={meta.icon} size={24} color={meta.color} />
												</View>
												<View style={{ flex: 1 }}>
													<Text style={{ color: colors.foreground, fontSize: 16, fontWeight: '600' }}>
														{meta.label}
													</Text>
													<Text style={{ color: colors.mutedForeground, fontSize: 13, marginTop: 2 }}>
														Connected {new Date(conn.createdAt).toLocaleDateString('en-US', {
															year: 'numeric',
															month: 'short',
															day: 'numeric',
														})}
													</Text>
												</View>
												<View
													style={{
														paddingHorizontal: 10,
														paddingVertical: 4,
														borderRadius: 12,
														backgroundColor: colors.positiveGreen + '20',
													}}
												>
													<Text style={{ color: colors.positiveGreen, fontSize: 12, fontWeight: '600' }}>
														Connected
													</Text>
												</View>
											</View>
										</CardContent>
									</Card>
								</FadeIn>
							)
						})}
					</View>
				)}

				<Text style={{ color: colors.mutedForeground, fontSize: 13, textAlign: 'center', marginTop: 24, paddingHorizontal: 16 }}>
					To connect or disconnect accounts, visit ReefChronicles settings in your web browser.
				</Text>
			</ScrollView>
		</SafeAreaView>
	)
}
