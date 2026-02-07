import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			// Stale after 30 seconds — mobile users expect fresh data on return
			staleTime: 30 * 1000,
			// Keep unused data for 5 minutes
			gcTime: 5 * 60 * 1000,
			// Retry once on failure, then show error
			retry: 1,
			// Refetch when app comes back to foreground
			refetchOnWindowFocus: true,
		},
		mutations: {
			retry: 0,
		},
	},
})
