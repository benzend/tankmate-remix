/**
 * Tests for the useAuth Zustand store.
 * Verifies login, signup, logout, and session restoration flows.
 *
 * Run with: npx jest __tests__/useAuth.test.ts
 */

import { describe, it, expect, jest, beforeEach } from '@jest/globals'

// Mock the API and auth modules
jest.mock('../lib/api', () => ({
	authApi: {
		login: jest.fn(),
		signup: jest.fn(),
		logout: jest.fn(),
	},
	userApi: {
		me: jest.fn(),
	},
}))

jest.mock('../lib/auth', () => ({
	storeTokens: jest.fn(),
	clearTokens: jest.fn(),
	hasValidToken: jest.fn(),
	getToken: jest.fn(),
}))

jest.mock('expo-haptics', () => ({
	impactAsync: jest.fn(),
	ImpactFeedbackStyle: { Light: 'light' },
}))

describe('useAuth Store', () => {
	beforeEach(() => {
		jest.clearAllMocks()
		// Reset the zustand store
		const { useAuth } = require('../hooks/useAuth')
		useAuth.setState({ user: null, isLoading: true })
	})

	it('should login successfully and store user', async () => {
		const { authApi, userApi } = require('../lib/api')
		const { storeTokens } = require('../lib/auth')
		const { useAuth } = require('../hooks/useAuth')

		authApi.login.mockResolvedValue({
			token: 'session-123',
			expiresAt: '2025-12-31',
			userId: 'user-1',
		})
		userApi.me.mockResolvedValue({
			user: { id: 'user-1', username: 'testuser', name: 'Test', email: 'test@test.com' },
		})

		await useAuth.getState().login('testuser', 'password123')

		expect(authApi.login).toHaveBeenCalledWith({ username: 'testuser', password: 'password123' })
		expect(storeTokens).toHaveBeenCalledWith('session-123', '2025-12-31', 'user-1')
		expect(useAuth.getState().user).toEqual({
			id: 'user-1',
			username: 'testuser',
			name: 'Test',
			email: 'test@test.com',
		})
		expect(useAuth.getState().isLoading).toBe(false)
	})

	it('should handle login failure', async () => {
		const { authApi } = require('../lib/api')
		const { useAuth } = require('../hooks/useAuth')

		authApi.login.mockRejectedValue(new Error('Invalid credentials'))

		await expect(useAuth.getState().login('bad', 'creds')).rejects.toThrow()
		expect(useAuth.getState().user).toBeNull()
		expect(useAuth.getState().isLoading).toBe(false)
	})

	it('should logout and clear tokens', async () => {
		const { authApi } = require('../lib/api')
		const { clearTokens } = require('../lib/auth')
		const { useAuth } = require('../hooks/useAuth')

		// Set a logged-in state
		useAuth.setState({ user: { id: 'user-1' }, isLoading: false })

		authApi.logout.mockResolvedValue({ success: true })

		await useAuth.getState().logout()

		expect(authApi.logout).toHaveBeenCalled()
		expect(clearTokens).toHaveBeenCalled()
		expect(useAuth.getState().user).toBe(false)
	})

	it('should restore session from stored token', async () => {
		const { userApi } = require('../lib/api')
		const { hasValidToken } = require('../lib/auth')
		const { useAuth } = require('../hooks/useAuth')

		hasValidToken.mockResolvedValue(true)
		userApi.me.mockResolvedValue({
			user: { id: 'user-1', username: 'restored' },
		})

		await useAuth.getState().restore()

		expect(useAuth.getState().user).toEqual({ id: 'user-1', username: 'restored' })
		expect(useAuth.getState().isLoading).toBe(false)
	})

	it('should set user to false when no stored token exists', async () => {
		const { hasValidToken } = require('../lib/auth')
		const { useAuth } = require('../hooks/useAuth')

		hasValidToken.mockResolvedValue(false)

		await useAuth.getState().restore()

		expect(useAuth.getState().user).toBe(false)
		expect(useAuth.getState().isLoading).toBe(false)
	})
})
