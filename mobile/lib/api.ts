import Constants from 'expo-constants'
import { getToken, storeTokens, clearTokens } from './auth'

const API_URL = Constants.expoConfig?.extra?.apiUrl || 'http://localhost:8081'
const BASE = `${API_URL}/api/v1`

type RequestOptions = {
	method?: string
	body?: unknown
	headers?: Record<string, string>
	/** Skip auth header (for login/signup) */
	noAuth?: boolean
	/** Internal: skip refresh retry to prevent infinite loops */
	_skipRefresh?: boolean
}

class ApiError extends Error {
	constructor(
		public status: number,
		public data: unknown,
	) {
		super(`API Error ${status}`)
		this.name = 'ApiError'
	}
}

/** Track whether a refresh is already in flight to avoid concurrent refreshes */
let refreshPromise: Promise<boolean> | null = null

async function attemptTokenRefresh(): Promise<boolean> {
	if (refreshPromise) return refreshPromise

	refreshPromise = (async () => {
		try {
			const token = await getToken()
			if (!token) return false

			const response = await fetch(`${BASE}/auth/refresh`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${token}`,
				},
			})

			if (!response.ok) return false

			const data = await response.json()
			await storeTokens(data.token, data.expiresAt, data.userId)
			return true
		} catch {
			return false
		} finally {
			refreshPromise = null
		}
	})()

	return refreshPromise
}

/**
 * Core fetch wrapper that handles:
 * - Bearer token injection from secure storage
 * - JSON serialization
 * - Error normalization
 * - 401 → attempt token refresh, then retry once; clear tokens on failure
 */
export async function api<T = unknown>(
	path: string,
	options: RequestOptions = {},
): Promise<T> {
	const { method = 'GET', body, headers = {}, noAuth = false, _skipRefresh = false } = options

	const requestHeaders: Record<string, string> = {
		'Content-Type': 'application/json',
		...headers,
	}

	if (!noAuth) {
		const token = await getToken()
		if (token) {
			requestHeaders['Authorization'] = `Bearer ${token}`
		}
	}

	const response = await fetch(`${BASE}${path}`, {
		method,
		headers: requestHeaders,
		body: body ? JSON.stringify(body) : undefined,
	})

	// Handle 401 — try refreshing the token once before giving up
	if (response.status === 401 && !noAuth && !_skipRefresh) {
		const refreshed = await attemptTokenRefresh()
		if (refreshed) {
			// Retry the original request with the new token
			return api<T>(path, { ...options, _skipRefresh: true })
		}

		await clearTokens()
		throw new ApiError(401, { error: 'Session expired' })
	}

	const data = await response.json()

	if (!response.ok) {
		throw new ApiError(response.status, data)
	}

	return data as T
}

// ─── Auth ──────────────────────────────────────────

export const authApi = {
	login: (body: { username: string; password: string }) =>
		api<{ token: string; expiresAt: string; userId: string }>('/auth/login', {
			method: 'POST',
			body,
			noAuth: true,
		}),

	signup: (body: { email: string; username: string; password: string; name: string }) =>
		api<{ token: string; expiresAt: string; userId: string }>('/auth/signup', {
			method: 'POST',
			body,
			noAuth: true,
		}),

	logout: () => api('/auth/logout', { method: 'POST' }),

	refresh: () =>
		api<{ token: string; expiresAt: string; userId: string }>('/auth/refresh', {
			method: 'POST',
		}),
}

// ─── Tanks ─────────────────────────────────────────

export const tanksApi = {
	list: () => api<{ tanks: Tank[] }>('/tanks'),

	get: (id: string) => api<{ tank: TankDetail }>(`/tanks/${id}`),

	create: (body: { name?: string; waterType: string; imageUrl?: string; volume?: number }) =>
		api<{ tank: { id: string } }>('/tanks', { method: 'POST', body }),

	update: (id: string, body: Partial<TankUpdate>) =>
		api<{ tank: { id: string } }>(`/tanks/${id}`, { method: 'PATCH', body }),

	delete: (id: string) =>
		api<{ success: boolean; deletedTank: string }>(`/tanks/${id}`, { method: 'DELETE' }),
}

// ─── Parameters ────────────────────────────────────

export const parametersApi = {
	listForTank: (tankId: string) =>
		api<{ parameterLogs: ParameterLog[] }>(`/tanks/${tankId}/parameters`),

	create: (tankId: string, body: CreateParameterLog) =>
		api<{ parameterLog: { id: string } }>(`/tanks/${tankId}/parameters`, {
			method: 'POST',
			body,
		}),

	get: (id: string) => api<{ parameterLog: ParameterLog }>(`/parameters/${id}`),
}

// ─── Maintenance ───────────────────────────────────

export const maintenanceApi = {
	listForTank: (tankId: string) =>
		api<{ maintenanceLogs: MaintenanceLog[] }>(`/tanks/${tankId}/maintenance`),

	create: (
		tankId: string,
		body: { maintenanceType: string; extraDetails?: string },
	) =>
		api<{ maintenanceLog: { id: string } }>(`/tanks/${tankId}/maintenance`, {
			method: 'POST',
			body,
		}),

	get: (id: string) =>
		api<{ maintenanceLog: MaintenanceLog }>(`/maintenance/${id}`),
}

// ─── Coral Analyses ────────────────────────────────

export const coralApi = {
	list: () => api<{ coralAnalyses: CoralAnalysis[] }>('/coral-analyses'),

	get: (id: string) => api<{ coralAnalysis: CoralAnalysis }>(`/coral-analyses/${id}`),

	analyze: (body: { imageUrl: string; fishTankId?: string }) =>
		api<{ coralAnalysis: CoralAnalysis }>('/coral-analyses', {
			method: 'POST',
			body,
		}),
}

// ─── Gallery ───────────────────────────────────────

export const galleryApi = {
	listAll: () => api<{ galleries: GalleryImage[] }>('/galleries'),

	listForTank: (tankId: string) =>
		api<{ gallery: GalleryImage[] }>(`/tanks/${tankId}/gallery`),

	addImages: (
		tankId: string,
		images: Array<{
			imageUrl: string
			title?: string | null
			description?: string | null
			altText?: string | null
		}>,
	) =>
		api<{ success: boolean; count: number }>(`/tanks/${tankId}/gallery`, {
			method: 'POST',
			body: { images },
		}),

	update: (
		id: string,
		body: { title?: string | null; description?: string | null; altText?: string | null },
	) => api<{ galleryImage: { id: string } }>(`/gallery/${id}`, { method: 'PATCH', body }),

	delete: (id: string) => api<{ success: boolean }>(`/gallery/${id}`, { method: 'DELETE' }),

	togglePublish: (tankId: string) =>
		api<{ tankId: string; isGalleryPublished: boolean }>(
			`/tanks/${tankId}/gallery/publish`,
			{ method: 'PATCH' },
		),
}

// ─── User ──────────────────────────────────────────

export const userApi = {
	me: () => api<{ user: UserProfile }>('/user/me'),

	updateProfile: (body: { username?: string; name?: string }) =>
		api<{ user: UserProfile }>('/user/me', { method: 'PATCH', body }),

	changePassword: (body: { currentPassword: string; newPassword: string }) =>
		api<{ success: boolean }>('/user/me/password', { method: 'POST', body }),

	getConnections: () =>
		api<{ connections: OAuthConnection[] }>('/user/me/connections'),

	exportData: () => api<unknown>('/user/me/data-export'),

	signOutOtherSessions: () =>
		api<{ success: boolean; sessionsRevoked: number }>('/user/me/sign-out-others', {
			method: 'POST',
		}),

	deleteAccount: () =>
		api<{ success: boolean }>('/user/me', { method: 'DELETE' }),
}

// ─── Search ────────────────────────────────────────

export const searchApi = {
	search: (query: string) =>
		api<{ results: SearchResult[] }>(`/search?q=${encodeURIComponent(query)}`),
}

// ─── Push Notifications ────────────────────────────

export const pushApi = {
	register: (body: { token: string; platform: 'ios' | 'android' }) =>
		api<{ success: boolean }>('/push/register', { method: 'POST', body }),

	unregister: (token: string) =>
		api<{ success: boolean }>('/push/unregister', {
			method: 'DELETE',
			body: { token },
		}),
}

// ─── Subscription ─────────────────────────────────

export const subscriptionApi = {
	get: () => api<{ subscription: Subscription }>('/subscription'),

	getPlans: () => api<{ plans: SubscriptionPlanInfo[] }>('/subscription/plans'),

	validateReceipt: (body: {
		plan: 'pro' | 'premium'
		provider: 'apple' | 'google'
		revenueCatUserId: string
		entitlementId: string
		expiresDate?: string
	}) =>
		api<{ subscription: Subscription }>('/subscription/validate-receipt', {
			method: 'POST',
			body,
		}),

	cancel: () =>
		api<{ subscription: Subscription }>('/subscription/cancel', {
			method: 'POST',
		}),

	restore: (body: {
		plan: 'pro' | 'premium'
		provider: 'apple' | 'google'
		revenueCatUserId: string
		entitlementId: string
		expiresDate?: string
	}) =>
		api<{ subscription: Subscription }>('/subscription/restore', {
			method: 'POST',
			body,
		}),
}

// ─── Types ─────────────────────────────────────────

export type Tank = {
	id: string
	name: string
	dimensionsWidth: number | null
	dimensionsLength: number | null
	dimensionsHeight: number | null
	imageUrl: string | null
	volume: number | null
	waterType: string
	fishTankScores: Array<{ result: string | null; imageUrl: string | null }>
}

export type TankDetail = Tank & {
	fishTankScores: Array<{ id: string; result: string | null; imageUrl: string | null }>
	gallery: GalleryImage[]
	fishTankMaintenances: MaintenanceLog[]
	parameterLogs: ParameterLog[]
}

export type TankUpdate = {
	name: string
	waterType: string
	dimensionsLength: number
	dimensionsWidth: number
	dimensionsHeight: number
	imageUrl: string
	volume: number
}

export type ParameterLog = {
	id: string
	temp: number | null
	alk: number | null
	calcium: number | null
	magnesium: number | null
	salinity: number | null
	pH: number | null
	nitrate: number | null
	phosphate: number | null
	createdAt: string
	fishTankId?: string
}

export type CreateParameterLog = {
	calcium?: number | null
	alk?: number | null
	magnesium?: number | null
	pH?: number | null
	temp?: number | null
	nitrate?: number | null
	phosphate?: number | null
	salinity?: number | null
	createdAt?: string
}

export type MaintenanceLog = {
	id: string
	maintenanceType: string
	extraDetails: string | null
	createdAt: string
	fishTankId?: string
}

export type CoralAnalysis = {
	id: string
	friendlyName: string
	scientificName: string
	healthScore: number
	otherDetails: string | null
	imageUrl: string | null
	createdAt?: string
}

export type GalleryImage = {
	id: string
	title: string | null
	description: string | null
	imageUrl: string
	altText: string | null
	createdAt: string
	fishTankId?: string
}

export type UserProfile = {
	id: string
	email: string
	username: string
	name: string | null
	image: { id: string } | null
	createdAt: string
}

export type OAuthConnection = {
	id: string
	providerName: string
	providerId: string
	createdAt: string
}

export type SearchResult = {
	title: string
	url: string | null
	content: string | null
}

export type Subscription = {
	plan: 'free' | 'pro' | 'premium'
	status: 'active' | 'canceled' | 'past_due' | 'trialing' | 'expired'
	provider: 'stripe' | 'apple' | 'google' | null
	currentPeriodStart: string | null
	currentPeriodEnd: string | null
	cancelAtPeriodEnd: boolean
}

export type SubscriptionPlanInfo = {
	id: string
	name: string
	tanks: number
	parameterLogsPerMonth: number
	coralAnalysesPerMonth: number
	galleryImagesPerTank: number
	prices: { monthly: number; yearly: number } | null
}
