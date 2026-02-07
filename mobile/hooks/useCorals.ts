import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { coralApi } from '../lib/api'

export const coralKeys = {
	all: ['coral-analyses'] as const,
	detail: (id: string) => ['coral-analyses', id] as const,
}

export function useCoralAnalyses() {
	return useQuery({
		queryKey: coralKeys.all,
		queryFn: async () => {
			const { coralAnalyses } = await coralApi.list()
			return coralAnalyses
		},
	})
}

export function useCoralAnalysis(id: string) {
	return useQuery({
		queryKey: coralKeys.detail(id),
		queryFn: async () => {
			const { coralAnalysis } = await coralApi.get(id)
			return coralAnalysis
		},
		enabled: !!id,
	})
}

export function useAnalyzeCoral() {
	const queryClient = useQueryClient()
	return useMutation({
		mutationFn: (data: { imageUrl: string; fishTankId?: string }) =>
			coralApi.analyze(data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: coralKeys.all })
		},
	})
}
