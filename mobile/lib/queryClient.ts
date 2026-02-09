import { QueryClient } from '@tanstack/react-query'
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister'
import AsyncStorage from '@react-native-async-storage/async-storage'

export const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			// Stale after 30 seconds — mobile users expect fresh data on return
			staleTime: 30 * 1000,
			// Keep unused data for 24 hours (long cache for offline support)
			gcTime: 24 * 60 * 60 * 1000,
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

/**
 * Persister that saves the query cache to AsyncStorage.
 * When the app reopens offline, stale data is served from cache
 * while a background refetch is attempted.
 */
export const asyncStoragePersister = createAsyncStoragePersister({
	storage: AsyncStorage,
	key: 'reefchronicles-query-cache',
	throttleTime: 1000,
})
