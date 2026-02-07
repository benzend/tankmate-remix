import { useQuery } from '@tanstack/react-query'
import { searchApi } from '../lib/api'

export function useSearch(query: string) {
	return useQuery({
		queryKey: ['search', query],
		queryFn: () => searchApi.search(query),
		enabled: query.length >= 2,
		// Don't refetch search results on focus
		refetchOnWindowFocus: false,
		staleTime: 60 * 1000,
	})
}
