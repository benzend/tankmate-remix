import { View, Text, ScrollView, Pressable, Alert, Platform, ActivityIndicator } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { colors } from '../theme/colors'
import {
	useSubscription,
	useSubscriptionPlans,
	useValidateReceipt,
	useCancelSubscription,
	useRestoreSubscription,
	isPaidPlan,
} from '../hooks/useSubscription'
import { useToast } from '../components/ui/Toast'

const PLAN_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
	free: 'fish-outline',
	pro: 'star-outline',
	premium: 'diamond-outline',
}

export default function SubscriptionScreen() {
	const router = useRouter()
	const toast = useToast()
	const { data: subscription, isLoading: subLoading } = useSubscription()
	const { data: plans, isLoading: plansLoading } = useSubscriptionPlans()
	const validateReceipt = useValidateReceipt()
	const cancelSubscription = useCancelSubscription()
	const restoreSubscription = useRestoreSubscription()

	const isLoading = subLoading || plansLoading
	const currentPlan = subscription?.plan ?? 'free'
	const hasPaid = isPaidPlan(subscription)

	const handlePurchase = async (planId: 'pro' | 'premium') => {
		// RevenueCat integration point:
		// In production, you would call Purchases.purchasePackage() here
		// and then validate the receipt with the server.
		//
		// Example:
		// import Purchases from 'react-native-purchases'
		// const offerings = await Purchases.getOfferings()
		// const pkg = offerings.current?.availablePackages.find(p => p.identifier === planId)
		// const { customerInfo } = await Purchases.purchasePackage(pkg)
		// const entitlement = customerInfo.entitlements.active['pro'] || customerInfo.entitlements.active['premium']
		// await validateReceipt.mutateAsync({
		//   plan: planId,
		//   provider: Platform.OS === 'ios' ? 'apple' : 'google',
		//   revenueCatUserId: customerInfo.originalAppUserId,
		//   entitlementId: entitlement.identifier,
		//   expiresDate: entitlement.expirationDate,
		// })

		Alert.alert(
			'Purchase',
			`To complete your ${planId} subscription, RevenueCat must be configured with your App Store / Play Store credentials. See the setup guide in the README.`,
			[{ text: 'OK' }],
		)
	}

	const handleCancel = () => {
		Alert.alert(
			'Cancel Subscription',
			'Your subscription will remain active until the end of the current billing period.',
			[
				{ text: 'Keep Subscription', style: 'cancel' },
				{
					text: 'Cancel',
					style: 'destructive',
					onPress: () => {
						cancelSubscription.mutate(undefined, {
							onSuccess: () => toast.success('Subscription canceled'),
							onError: () => toast.error('Failed to cancel subscription'),
						})
					},
				},
			],
		)
	}

	const handleRestore = () => {
		// RevenueCat integration point:
		// import Purchases from 'react-native-purchases'
		// const { customerInfo } = await Purchases.restorePurchases()
		// Then sync with server via restoreSubscription.mutateAsync(...)
		Alert.alert(
			'Restore Purchases',
			'RevenueCat must be configured to restore purchases. See the setup guide in the README.',
			[{ text: 'OK' }],
		)
	}

	if (isLoading) {
		return (
			<SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
				<View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
					<ActivityIndicator size="large" color={colors.primary} />
				</View>
			</SafeAreaView>
		)
	}

	return (
		<SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>
			<ScrollView contentContainerStyle={{ padding: 16 }}>
				{/* Header */}
				<View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 24 }}>
					<Pressable onPress={() => router.back()} style={{ marginRight: 12 }}>
						<Ionicons name="arrow-back" size={24} color={colors.foreground} />
					</Pressable>
					<Text style={{ color: colors.foreground, fontSize: 22, fontWeight: '700' }}>
						Subscription
					</Text>
				</View>

				{/* Current Plan Badge */}
				<View
					style={{
						backgroundColor: colors.card,
						borderRadius: 12,
						borderWidth: 1,
						borderColor: colors.border,
						padding: 20,
						marginBottom: 24,
						alignItems: 'center',
					}}
				>
					<Ionicons
						name={PLAN_ICONS[currentPlan] ?? 'fish-outline'}
						size={36}
						color={currentPlan === 'free' ? colors.mutedForeground : colors.positiveGreen}
					/>
					<Text
						style={{
							color: colors.foreground,
							fontSize: 20,
							fontWeight: '700',
							marginTop: 8,
							textTransform: 'capitalize',
						}}
					>
						{currentPlan} Plan
					</Text>
					{subscription?.currentPeriodEnd && (
						<Text style={{ color: colors.mutedForeground, fontSize: 13, marginTop: 4 }}>
							{subscription.cancelAtPeriodEnd ? 'Cancels' : 'Renews'}{' '}
							{new Date(subscription.currentPeriodEnd).toLocaleDateString()}
						</Text>
					)}
					{subscription?.status === 'past_due' && (
						<Text style={{ color: colors.negativeRed, fontSize: 13, marginTop: 4 }}>
							Payment past due
						</Text>
					)}
				</View>

				{/* Plan Cards */}
				{plans?.map((plan) => {
					const isCurrent = plan.id === currentPlan
					const isUpgrade =
						plan.id !== 'free' &&
						(currentPlan === 'free' ||
							(currentPlan === 'pro' && plan.id === 'premium'))

					return (
						<View
							key={plan.id}
							style={{
								backgroundColor: colors.card,
								borderRadius: 12,
								borderWidth: isCurrent ? 2 : 1,
								borderColor: isCurrent ? colors.positiveGreen : colors.border,
								padding: 20,
								marginBottom: 16,
							}}
						>
							<View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
								<Ionicons
									name={PLAN_ICONS[plan.id] ?? 'fish-outline'}
									size={22}
									color={plan.id === 'free' ? colors.mutedForeground : colors.positiveGreen}
									style={{ marginRight: 10 }}
								/>
								<Text style={{ color: colors.foreground, fontSize: 18, fontWeight: '600', flex: 1 }}>
									{plan.name}
								</Text>
								{plan.prices && (
									<Text style={{ color: colors.foreground, fontSize: 18, fontWeight: '700' }}>
										${plan.prices.monthly.toFixed(2)}/mo
									</Text>
								)}
								{!plan.prices && (
									<Text style={{ color: colors.mutedForeground, fontSize: 16 }}>Free</Text>
								)}
							</View>

							{/* Features */}
							<View style={{ marginBottom: 16 }}>
								<FeatureRow
									label="Tanks"
									value={plan.tanks === -1 ? 'Unlimited' : `${plan.tanks}`}
								/>
								<FeatureRow
									label="Parameter logs/mo"
									value={plan.parameterLogsPerMonth === -1 ? 'Unlimited' : `${plan.parameterLogsPerMonth}`}
								/>
								<FeatureRow
									label="Coral analyses/mo"
									value={plan.coralAnalysesPerMonth === -1 ? 'Unlimited' : `${plan.coralAnalysesPerMonth}`}
								/>
								<FeatureRow
									label="Gallery images/tank"
									value={plan.galleryImagesPerTank === -1 ? 'Unlimited' : `${plan.galleryImagesPerTank}`}
								/>
							</View>

							{isCurrent ? (
								<View
									style={{
										backgroundColor: colors.accent,
										borderRadius: 8,
										paddingVertical: 12,
										alignItems: 'center',
									}}
								>
									<Text style={{ color: colors.mutedForeground, fontWeight: '600' }}>
										Current Plan
									</Text>
								</View>
							) : isUpgrade ? (
								<Pressable
									onPress={() => handlePurchase(plan.id as 'pro' | 'premium')}
									style={({ pressed }) => ({
										backgroundColor: pressed ? colors.accent : colors.primary,
										borderRadius: 8,
										paddingVertical: 12,
										alignItems: 'center',
									})}
								>
									<Text style={{ color: colors.primaryForeground, fontWeight: '700', fontSize: 16 }}>
										Upgrade to {plan.name}
									</Text>
								</Pressable>
							) : null}
						</View>
					)
				})}

				{/* Actions */}
				{hasPaid && (
					<Pressable
						onPress={handleCancel}
						style={{ paddingVertical: 16, alignItems: 'center' }}
					>
						<Text style={{ color: colors.negativeRed, fontSize: 14 }}>
							Cancel Subscription
						</Text>
					</Pressable>
				)}

				<Pressable
					onPress={handleRestore}
					style={{ paddingVertical: 12, alignItems: 'center' }}
				>
					<Text style={{ color: colors.mutedForeground, fontSize: 14 }}>
						Restore Purchases
					</Text>
				</Pressable>

				<View style={{ height: 40 }} />
			</ScrollView>
		</SafeAreaView>
	)
}

function FeatureRow({ label, value }: { label: string; value: string }) {
	return (
		<View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 }}>
			<Text style={{ color: colors.mutedForeground, fontSize: 14 }}>{label}</Text>
			<Text style={{ color: colors.foreground, fontSize: 14, fontWeight: '500' }}>{value}</Text>
		</View>
	)
}
