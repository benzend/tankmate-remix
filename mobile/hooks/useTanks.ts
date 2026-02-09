import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { tanksApi, type Tank, type TankDetail, type TankUpdate } from '../lib/api'

export const tankKeys = {
	all: ['tanks'] as const,
	detail: (id: string) => ['tanks', id] as const,
}

export function useTanks() {
	return useQuery({
		queryKey: tankKeys.all,
		queryFn: async () => {
			const { tanks } = await tanksApi.list()
			return tanks
		},
	})
}

export function useTank(id: string) {
	return useQuery({
		queryKey: tankKeys.detail(id),
		queryFn: async () => {
			const { tank } = await tanksApi.get(id)
			return tank
		},
		enabled: !!id,
	})
}

export function useCreateTank() {
	const queryClient = useQueryClient()
	return useMutation({
		mutationFn: (data: { name?: string; waterType: string; imageUrl?: string; volume?: number }) =>
			tanksApi.create(data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: tankKeys.all })
		},
	})
}

export function useUpdateTank(id: string) {
	const queryClient = useQueryClient()
	return useMutation({
		mutationFn: (data: Partial<TankUpdate>) => tanksApi.update(id, data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: tankKeys.all })
			queryClient.invalidateQueries({ queryKey: tankKeys.detail(id) })
		},
	})
}

export function useDeleteTank() {
	const queryClient = useQueryClient()
	return useMutation({
		mutationFn: (id: string) => tanksApi.delete(id),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: tankKeys.all })
		},
	})
}
