import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { parametersApi, type CreateParameterLog } from '../lib/api'
import { tankKeys } from './useTanks'

export const parameterKeys = {
	forTank: (tankId: string) => ['parameters', tankId] as const,
	detail: (id: string) => ['parameters', 'detail', id] as const,
}

export function useParameterLogs(tankId: string) {
	return useQuery({
		queryKey: parameterKeys.forTank(tankId),
		queryFn: async () => {
			const { parameterLogs } = await parametersApi.listForTank(tankId)
			return parameterLogs
		},
		enabled: !!tankId,
	})
}

export function useCreateParameterLog(tankId: string) {
	const queryClient = useQueryClient()
	return useMutation({
		mutationFn: (data: CreateParameterLog) => parametersApi.create(tankId, data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: parameterKeys.forTank(tankId) })
			queryClient.invalidateQueries({ queryKey: tankKeys.detail(tankId) })
		},
	})
}
