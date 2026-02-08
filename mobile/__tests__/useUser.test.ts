/**
 * Tests for useUser hook — profile, password change, connections, and export.
 *
 * Run with: npx jest __tests__/useUser.test.ts
 */

import { describe, it, expect, jest, beforeEach } from '@jest/globals'
import { renderHook, waitFor } from '@testing-library/react-native'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import React from 'react'

// Mock the API module
jest.mock('../lib/api', () => ({
	userApi: {
		me: jest.fn(),
		updateProfile: jest.fn(),
		changePassword: jest.fn(),
		getConnections: jest.fn(),
		exportData: jest.fn(),
		signOutOtherSessions: jest.fn(),
		deleteAccount: jest.fn(),
	},
}))

function createWrapper() {
	const queryClient = new QueryClient({
		defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
	})
	return function Wrapper({ children }: { children: React.ReactNode }) {
		return React.createElement(QueryClientProvider, { client: queryClient }, children)
	}
}

describe('useUserProfile', () => {
	beforeEach(() => {
		jest.clearAllMocks()
	})

	it('should fetch user profile', async () => {
		const { userApi } = require('../lib/api')
		userApi.me.mockResolvedValue({
			user: { id: 'u1', email: 'a@b.com', username: 'testuser', name: 'Test', createdAt: '2024-01-01' },
		})

		const { useUserProfile } = require('../hooks/useUser')
		const { result } = renderHook(() => useUserProfile(), { wrapper: createWrapper() })

		await waitFor(() => expect(result.current.isSuccess).toBe(true))

		expect(result.current.data).toEqual({
			id: 'u1',
			email: 'a@b.com',
			username: 'testuser',
			name: 'Test',
			createdAt: '2024-01-01',
		})
		expect(userApi.me).toHaveBeenCalledTimes(1)
	})
})

describe('useUpdateProfile', () => {
	beforeEach(() => {
		jest.clearAllMocks()
	})

	it('should update profile and set query data', async () => {
		const { userApi } = require('../lib/api')
		const updatedUser = { id: 'u1', username: 'newname', name: 'New Name', email: 'a@b.com' }
		userApi.updateProfile.mockResolvedValue({ user: updatedUser })

		const { useUpdateProfile } = require('../hooks/useUser')
		const { result } = renderHook(() => useUpdateProfile(), { wrapper: createWrapper() })

		await result.current.mutateAsync({ username: 'newname', name: 'New Name' })

		expect(userApi.updateProfile).toHaveBeenCalledWith({ username: 'newname', name: 'New Name' })
	})

	it('should reject with API error', async () => {
		const { userApi } = require('../lib/api')
		userApi.updateProfile.mockRejectedValue({ status: 409, data: { error: 'Username taken' } })

		const { useUpdateProfile } = require('../hooks/useUser')
		const { result } = renderHook(() => useUpdateProfile(), { wrapper: createWrapper() })

		await expect(
			result.current.mutateAsync({ username: 'taken' }),
		).rejects.toEqual({ status: 409, data: { error: 'Username taken' } })
	})
})

describe('useChangePassword', () => {
	beforeEach(() => {
		jest.clearAllMocks()
	})

	it('should change password successfully', async () => {
		const { userApi } = require('../lib/api')
		userApi.changePassword.mockResolvedValue({ success: true })

		const { useChangePassword } = require('../hooks/useUser')
		const { result } = renderHook(() => useChangePassword(), { wrapper: createWrapper() })

		await result.current.mutateAsync({
			currentPassword: 'old123',
			newPassword: 'new456',
		})

		expect(userApi.changePassword).toHaveBeenCalledWith({
			currentPassword: 'old123',
			newPassword: 'new456',
		})
	})

	it('should reject with wrong current password', async () => {
		const { userApi } = require('../lib/api')
		userApi.changePassword.mockRejectedValue({ status: 401, data: { error: 'Current password incorrect' } })

		const { useChangePassword } = require('../hooks/useUser')
		const { result } = renderHook(() => useChangePassword(), { wrapper: createWrapper() })

		await expect(
			result.current.mutateAsync({ currentPassword: 'wrong', newPassword: 'new456' }),
		).rejects.toEqual({ status: 401, data: { error: 'Current password incorrect' } })
	})
})

describe('useConnections', () => {
	beforeEach(() => {
		jest.clearAllMocks()
	})

	it('should fetch OAuth connections', async () => {
		const { userApi } = require('../lib/api')
		const mockConnections = [
			{ id: 'c1', providerName: 'github', providerId: '12345', createdAt: '2024-06-01' },
		]
		userApi.getConnections.mockResolvedValue({ connections: mockConnections })

		const { useConnections } = require('../hooks/useUser')
		const { result } = renderHook(() => useConnections(), { wrapper: createWrapper() })

		await waitFor(() => expect(result.current.isSuccess).toBe(true))

		expect(result.current.data).toEqual(mockConnections)
	})
})

describe('useExportData', () => {
	beforeEach(() => {
		jest.clearAllMocks()
	})

	it('should call export API', async () => {
		const { userApi } = require('../lib/api')
		userApi.exportData.mockResolvedValue({ data: 'export-blob' })

		const { useExportData } = require('../hooks/useUser')
		const { result } = renderHook(() => useExportData(), { wrapper: createWrapper() })

		await result.current.mutateAsync()

		expect(userApi.exportData).toHaveBeenCalledTimes(1)
	})
})

describe('useSignOutOtherSessions', () => {
	beforeEach(() => {
		jest.clearAllMocks()
	})

	it('should revoke other sessions and return count', async () => {
		const { userApi } = require('../lib/api')
		userApi.signOutOtherSessions.mockResolvedValue({ success: true, sessionsRevoked: 3 })

		const { useSignOutOtherSessions } = require('../hooks/useUser')
		const { result } = renderHook(() => useSignOutOtherSessions(), { wrapper: createWrapper() })

		const response = await result.current.mutateAsync()

		expect(userApi.signOutOtherSessions).toHaveBeenCalledTimes(1)
		expect(response.sessionsRevoked).toBe(3)
	})

	it('should handle error when sign out fails', async () => {
		const { userApi } = require('../lib/api')
		userApi.signOutOtherSessions.mockRejectedValue({ status: 500, data: { error: 'Server error' } })

		const { useSignOutOtherSessions } = require('../hooks/useUser')
		const { result } = renderHook(() => useSignOutOtherSessions(), { wrapper: createWrapper() })

		await expect(result.current.mutateAsync()).rejects.toEqual({
			status: 500,
			data: { error: 'Server error' },
		})
	})
})

describe('useDeleteAccount', () => {
	beforeEach(() => {
		jest.clearAllMocks()
	})

	it('should delete account successfully', async () => {
		const { userApi } = require('../lib/api')
		userApi.deleteAccount.mockResolvedValue({ success: true })

		const { useDeleteAccount } = require('../hooks/useUser')
		const { result } = renderHook(() => useDeleteAccount(), { wrapper: createWrapper() })

		const response = await result.current.mutateAsync()

		expect(userApi.deleteAccount).toHaveBeenCalledTimes(1)
		expect(response.success).toBe(true)
	})

	it('should handle error when deletion fails', async () => {
		const { userApi } = require('../lib/api')
		userApi.deleteAccount.mockRejectedValue({ status: 500, data: { error: 'Deletion failed' } })

		const { useDeleteAccount } = require('../hooks/useUser')
		const { result } = renderHook(() => useDeleteAccount(), { wrapper: createWrapper() })

		await expect(result.current.mutateAsync()).rejects.toEqual({
			status: 500,
			data: { error: 'Deletion failed' },
		})
	})
})
