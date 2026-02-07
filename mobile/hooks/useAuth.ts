import { create } from 'zustand'
import { authApi, userApi, type UserProfile } from '../lib/api'
import { storeTokens, clearTokens, hasValidToken, getToken } from '../lib/auth'

type AuthState = {
	/** null = loading, false = unauthenticated, UserProfile = authenticated */
	user: UserProfile | null | false
	isLoading: boolean
	login: (username: string, password: string) => Promise<void>
	signup: (data: {
		email: string
		username: string
		password: string
		name: string
	}) => Promise<void>
	logout: () => Promise<void>
	/** Check stored token on app launch */
	restore: () => Promise<void>
}

export const useAuth = create<AuthState>((set) => ({
	user: null,
	isLoading: true,

	login: async (username, password) => {
		set({ isLoading: true })
		try {
			const { token, expiresAt, userId } = await authApi.login({ username, password })
			await storeTokens(token, expiresAt, userId)
			const { user } = await userApi.me()
			set({ user, isLoading: false })
		} catch (error) {
			set({ isLoading: false })
			throw error
		}
	},

	signup: async (data) => {
		set({ isLoading: true })
		try {
			const { token, expiresAt, userId } = await authApi.signup(data)
			await storeTokens(token, expiresAt, userId)
			const { user } = await userApi.me()
			set({ user, isLoading: false })
		} catch (error) {
			set({ isLoading: false })
			throw error
		}
	},

	logout: async () => {
		try {
			await authApi.logout()
		} catch {
			// Logout API call failed — still clear local tokens
		}
		await clearTokens()
		set({ user: false, isLoading: false })
	},

	restore: async () => {
		set({ isLoading: true })
		try {
			const valid = await hasValidToken()
			if (!valid) {
				set({ user: false, isLoading: false })
				return
			}
			const { user } = await userApi.me()
			set({ user, isLoading: false })
		} catch {
			await clearTokens()
			set({ user: false, isLoading: false })
		}
	},
}))
