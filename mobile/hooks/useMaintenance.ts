import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { maintenanceApi } from '../lib/api'
import { tankKeys } from './useTanks'

export const maintenanceKeys = {
	forTank: (tankId: string) => ['maintenance', tankId] as const,
}

export function useMaintenanceLogs(tankId: string) {
	return useQuery({
		queryKey: maintenanceKeys.forTank(tankId),
		queryFn: async () => {
			const { maintenanceLogs } = await maintenanceApi.listForTank(tankId)
			return maintenanceLogs
		},
		enabled: !!tankId,
	})
}

export function useCreateMaintenanceLog(tankId: string) {
	const queryClient = useQueryClient()
	return useMutation({
		mutationFn: (data: { maintenanceType: string; extraDetails?: string }) =>
			maintenanceApi.create(tankId, data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: maintenanceKeys.forTank(tankId) })
			queryClient.invalidateQueries({ queryKey: tankKeys.detail(tankId) })
		},
	})
}
