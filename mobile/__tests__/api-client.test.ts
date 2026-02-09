/**
 * Tests for the mobile API client module.
 * Verifies request formatting, auth header injection, token refresh, and error handling.
 *
 * Run with: npx jest __tests__/api-client.test.ts
 */

import { describe, it, expect, jest, beforeEach } from '@jest/globals'

// Mock expo-secure-store
jest.mock('expo-secure-store', () => ({
	getItemAsync: jest.fn(),
	setItemAsync: jest.fn(),
	deleteItemAsync: jest.fn(),
}))

// Mock expo-constants
jest.mock('expo-constants', () => ({
	expoConfig: { extra: { apiUrl: 'http://test-server:8081' } },
}))

// Mock fetch
const mockFetch = jest.fn() as jest.MockedFunction<typeof fetch>
global.fetch = mockFetch

describe('API Client', () => {
	beforeEach(() => {
		jest.clearAllMocks()
		jest.resetModules()
	})

	it('should include Bearer token in authenticated requests', async () => {
		const SecureStore = require('expo-secure-store')
		SecureStore.getItemAsync.mockImplementation((key: string) => {
			if (key === 'tankmate_token') return Promise.resolve('test-session-id')
			if (key === 'tankmate_token_expiry') return Promise.resolve(new Date(Date.now() + 86400000).toISOString())
			return Promise.resolve(null)
		})

		mockFetch.mockResolvedValueOnce({
			ok: true,
			status: 200,
			json: () => Promise.resolve({ tanks: [] }),
		} as Response)

		const { api } = require('../lib/api')
		await api('/tanks')

		expect(mockFetch).toHaveBeenCalledWith(
			'http://test-server:8081/api/v1/tanks',
			expect.objectContaining({
				headers: expect.objectContaining({
					Authorization: 'Bearer test-session-id',
				}),
			}),
		)
	})

	it('should not include auth header for noAuth requests', async () => {
		mockFetch.mockResolvedValueOnce({
			ok: true,
			status: 200,
			json: () => Promise.resolve({ token: 'new-token' }),
		} as Response)

		const { api } = require('../lib/api')
		await api('/auth/login', { method: 'POST', body: { user: 'test' }, noAuth: true })

		const callHeaders = mockFetch.mock.calls[0]?.[1]?.headers as Record<string, string>
		expect(callHeaders?.Authorization).toBeUndefined()
	})

	it('should attempt token refresh on 401 before clearing tokens', async () => {
		const SecureStore = require('expo-secure-store')
		SecureStore.getItemAsync.mockImplementation((key: string) => {
			if (key === 'tankmate_token') return Promise.resolve('expired-token')
			if (key === 'tankmate_token_expiry') return Promise.resolve(new Date(Date.now() + 86400000).toISOString())
			return Promise.resolve(null)
		})

		// First call: original request returns 401
		// Second call: refresh attempt returns 200
		// Third call: retried original request succeeds
		mockFetch
			.mockResolvedValueOnce({
				ok: false,
				status: 401,
				json: () => Promise.resolve({ error: 'Invalid session' }),
			} as Response)
			.mockResolvedValueOnce({
				ok: true,
				status: 200,
				json: () => Promise.resolve({
					token: 'refreshed-token',
					expiresAt: new Date(Date.now() + 86400000).toISOString(),
					userId: 'user-1',
				}),
			} as Response)
			.mockResolvedValueOnce({
				ok: true,
				status: 200,
				json: () => Promise.resolve({ tanks: [] }),
			} as Response)

		const { api } = require('../lib/api')
		const result = await api('/tanks')

		expect(result).toEqual({ tanks: [] })
		// Should have made 3 fetch calls: original, refresh, retry
		expect(mockFetch).toHaveBeenCalledTimes(3)
		// Second call should be to refresh endpoint
		expect(mockFetch.mock.calls[1]?.[0]).toBe('http://test-server:8081/api/v1/auth/refresh')
		// New token should be stored
		expect(SecureStore.setItemAsync).toHaveBeenCalledWith('tankmate_token', 'refreshed-token')
	})

	it('should clear tokens when refresh also fails', async () => {
		const SecureStore = require('expo-secure-store')
		SecureStore.getItemAsync.mockImplementation((key: string) => {
			if (key === 'tankmate_token') return Promise.resolve('expired-token')
			if (key === 'tankmate_token_expiry') return Promise.resolve(new Date(Date.now() + 86400000).toISOString())
			return Promise.resolve(null)
		})

		mockFetch
			.mockResolvedValueOnce({
				ok: false,
				status: 401,
				json: () => Promise.resolve({ error: 'Invalid session' }),
			} as Response)
			.mockResolvedValueOnce({
				ok: false,
				status: 401,
				json: () => Promise.resolve({ error: 'Session expired' }),
			} as Response)

		const { api } = require('../lib/api')
		await expect(api('/tanks')).rejects.toThrow()
		expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith('tankmate_token')
	})

	it('should not attempt refresh for noAuth 401 responses', async () => {
		mockFetch.mockResolvedValueOnce({
			ok: false,
			status: 401,
			json: () => Promise.resolve({ error: 'Bad credentials' }),
		} as Response)

		const { api } = require('../lib/api')

		try {
			await api('/auth/login', { method: 'POST', body: {}, noAuth: true })
		} catch (err: any) {
			expect(err.status).toBe(401)
		}
		// No refresh attempt for noAuth requests
		expect(mockFetch).toHaveBeenCalledTimes(1)
	})

	it('should throw ApiError with status and data for non-OK responses', async () => {
		mockFetch.mockResolvedValueOnce({
			ok: false,
			status: 400,
			json: () => Promise.resolve({ error: 'Invalid data' }),
		} as Response)

		const { api } = require('../lib/api')

		try {
			await api('/tanks', { method: 'POST', body: {}, noAuth: true })
			expect(true).toBe(false)
		} catch (err: any) {
			expect(err.status).toBe(400)
			expect(err.data.error).toBe('Invalid data')
		}
	})
})

describe('Auth Token Storage', () => {
	beforeEach(() => {
		jest.clearAllMocks()
		jest.resetModules()
	})

	it('should store tokens in secure storage', async () => {
		const SecureStore = require('expo-secure-store')
		const { storeTokens } = require('../lib/auth')

		await storeTokens('session-123', '2025-12-31T00:00:00Z', 'user-456')

		expect(SecureStore.setItemAsync).toHaveBeenCalledWith('tankmate_token', 'session-123')
		expect(SecureStore.setItemAsync).toHaveBeenCalledWith('tankmate_token_expiry', '2025-12-31T00:00:00Z')
		expect(SecureStore.setItemAsync).toHaveBeenCalledWith('tankmate_user_id', 'user-456')
	})

	it('should return null for expired tokens', async () => {
		const SecureStore = require('expo-secure-store')
		SecureStore.getItemAsync.mockImplementation((key: string) => {
			if (key === 'tankmate_token') return Promise.resolve('expired-token')
			if (key === 'tankmate_token_expiry') return Promise.resolve('2020-01-01T00:00:00Z')
			return Promise.resolve(null)
		})

		const { getToken } = require('../lib/auth')
		const token = await getToken()

		expect(token).toBeNull()
		expect(SecureStore.deleteItemAsync).toHaveBeenCalled()
	})

	it('should clear all tokens on clearTokens', async () => {
		const SecureStore = require('expo-secure-store')
		const { clearTokens } = require('../lib/auth')

		await clearTokens()

		expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith('tankmate_token')
		expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith('tankmate_token_expiry')
		expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith('tankmate_user_id')
	})
})
