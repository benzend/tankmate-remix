import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { userApi } from '../lib/api'

export const userKeys = {
	profile: ['user', 'profile'] as const,
	connections: ['user', 'connections'] as const,
}

export function useUserProfile() {
	return useQuery({
		queryKey: userKeys.profile,
		queryFn: async () => {
			const { user } = await userApi.me()
			return user
		},
	})
}

export function useUpdateProfile() {
	const queryClient = useQueryClient()
	return useMutation({
		mutationFn: (data: { username?: string; name?: string }) =>
			userApi.updateProfile(data),
		onSuccess: ({ user }) => {
			queryClient.setQueryData(userKeys.profile, user)
		},
	})
}

export function useChangePassword() {
	return useMutation({
		mutationFn: (data: { currentPassword: string; newPassword: string }) =>
			userApi.changePassword(data),
	})
}

export function useConnections() {
	return useQuery({
		queryKey: userKeys.connections,
		queryFn: async () => {
			const { connections } = await userApi.getConnections()
			return connections
		},
	})
}

export function useExportData() {
	return useMutation({
		mutationFn: () => userApi.exportData(),
	})
}

export function useSignOutOtherSessions() {
	return useMutation({
		mutationFn: () => userApi.signOutOtherSessions(),
	})
}

export function useDeleteAccount() {
	return useMutation({
		mutationFn: () => userApi.deleteAccount(),
	})
}
