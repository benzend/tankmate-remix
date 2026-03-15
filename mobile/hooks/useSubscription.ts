import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { subscriptionApi, type Subscription, type SubscriptionPlanInfo } from '../lib/api'

export const subscriptionKeys = {
	current: ['subscription'] as const,
	plans: ['subscription', 'plans'] as const,
}

export function useSubscription() {
	return useQuery({
		queryKey: subscriptionKeys.current,
		queryFn: async () => {
			const { subscription } = await subscriptionApi.get()
			return subscription
		},
	})
}

export function useSubscriptionPlans() {
	return useQuery({
		queryKey: subscriptionKeys.plans,
		queryFn: async () => {
			const { plans } = await subscriptionApi.getPlans()
			return plans
		},
	})
}

export function useValidateReceipt() {
	const queryClient = useQueryClient()
	return useMutation({
		mutationFn: (data: {
			plan: 'pro' | 'premium'
			provider: 'apple' | 'google'
			revenueCatUserId: string
			entitlementId: string
			expiresDate?: string
		}) => subscriptionApi.validateReceipt(data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: subscriptionKeys.current })
		},
	})
}

export function useCancelSubscription() {
	const queryClient = useQueryClient()
	return useMutation({
		mutationFn: () => subscriptionApi.cancel(),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: subscriptionKeys.current })
		},
	})
}

export function useRestoreSubscription() {
	const queryClient = useQueryClient()
	return useMutation({
		mutationFn: (data: {
			plan: 'pro' | 'premium'
			provider: 'apple' | 'google'
			revenueCatUserId: string
			entitlementId: string
			expiresDate?: string
		}) => subscriptionApi.restore(data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: subscriptionKeys.current })
		},
	})
}

/** Simple helper to check if user has a paid plan */
export function isPaidPlan(subscription: Subscription | undefined): boolean {
	if (!subscription) return false
	if (subscription.plan === 'free') return false
	if (subscription.status === 'expired') return false
	if (
		subscription.status === 'canceled' &&
		subscription.currentPeriodEnd &&
		new Date(subscription.currentPeriodEnd) < new Date()
	) {
		return false
	}
	return true
}
