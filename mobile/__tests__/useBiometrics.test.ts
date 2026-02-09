/**
 * Tests for the biometric authentication hook.
 * Verifies hardware detection, enable/disable, and authentication flow.
 *
 * Run with: npx jest __tests__/useBiometrics.test.ts
 */

import { describe, it, expect, jest, beforeEach } from '@jest/globals'
import { renderHook, act, waitFor } from '@testing-library/react-native'
import * as LocalAuth from 'expo-local-authentication'
import * as SecureStore from 'expo-secure-store'
import { useBiometrics } from '../hooks/useBiometrics'

// Mock expo-local-authentication
jest.mock('expo-local-authentication', () => ({
	hasHardwareAsync: jest.fn(),
	isEnrolledAsync: jest.fn(),
	supportedAuthenticationTypesAsync: jest.fn(),
	authenticateAsync: jest.fn(),
	AuthenticationType: {
		FACIAL_RECOGNITION: 1,
		FINGERPRINT: 2,
		IRIS: 3,
	},
}))

// Mock expo-secure-store
jest.mock('expo-secure-store', () => ({
	getItemAsync: jest.fn(),
	setItemAsync: jest.fn(),
	deleteItemAsync: jest.fn(),
}))

const mockedLocalAuth = jest.mocked(LocalAuth)
const mockedSecureStore = jest.mocked(SecureStore)

describe('useBiometrics', () => {
	beforeEach(() => {
		jest.clearAllMocks()
	})

	it('should detect Face ID availability', async () => {
		mockedLocalAuth.hasHardwareAsync.mockResolvedValue(true)
		mockedLocalAuth.isEnrolledAsync.mockResolvedValue(true)
		mockedLocalAuth.supportedAuthenticationTypesAsync.mockResolvedValue([1]) // FACIAL_RECOGNITION
		mockedSecureStore.getItemAsync.mockResolvedValue(null)

		const { result } = renderHook(() => useBiometrics())

		await waitFor(() => {
			expect(result.current.isAvailable).toBe(true)
		})

		expect(result.current.biometricType).toBe('Face ID')
		expect(result.current.isEnabled).toBe(false)
	})

	it('should detect fingerprint availability', async () => {
		mockedLocalAuth.hasHardwareAsync.mockResolvedValue(true)
		mockedLocalAuth.isEnrolledAsync.mockResolvedValue(true)
		mockedLocalAuth.supportedAuthenticationTypesAsync.mockResolvedValue([2]) // FINGERPRINT
		mockedSecureStore.getItemAsync.mockResolvedValue(null)

		const { result } = renderHook(() => useBiometrics())

		await waitFor(() => {
			expect(result.current.isAvailable).toBe(true)
		})

		expect(result.current.biometricType).toBe('Fingerprint')
	})

	it('should report unavailable when no hardware', async () => {
		mockedLocalAuth.hasHardwareAsync.mockResolvedValue(false)
		mockedLocalAuth.isEnrolledAsync.mockResolvedValue(false)
		mockedSecureStore.getItemAsync.mockResolvedValue(null)

		const { result } = renderHook(() => useBiometrics())

		await waitFor(() => {
			expect(result.current.isAvailable).toBe(false)
		})
	})

	it('should read enabled state from secure store', async () => {
		mockedLocalAuth.hasHardwareAsync.mockResolvedValue(true)
		mockedLocalAuth.isEnrolledAsync.mockResolvedValue(true)
		mockedLocalAuth.supportedAuthenticationTypesAsync.mockResolvedValue([1])
		mockedSecureStore.getItemAsync.mockResolvedValue('true')

		const { result } = renderHook(() => useBiometrics())

		await waitFor(() => {
			expect(result.current.isEnabled).toBe(true)
		})
	})

	it('should enable biometric after successful verification', async () => {
		mockedLocalAuth.hasHardwareAsync.mockResolvedValue(true)
		mockedLocalAuth.isEnrolledAsync.mockResolvedValue(true)
		mockedLocalAuth.supportedAuthenticationTypesAsync.mockResolvedValue([1])
		mockedLocalAuth.authenticateAsync.mockResolvedValue({ success: true })
		mockedSecureStore.getItemAsync.mockResolvedValue(null)

		const { result } = renderHook(() => useBiometrics())

		await waitFor(() => expect(result.current.isAvailable).toBe(true))

		await act(async () => {
			await result.current.enable()
		})

		expect(mockedSecureStore.setItemAsync).toHaveBeenCalledWith('tankmate_biometric_enabled', 'true')
		expect(result.current.isEnabled).toBe(true)
	})

	it('should disable biometric', async () => {
		mockedLocalAuth.hasHardwareAsync.mockResolvedValue(true)
		mockedLocalAuth.isEnrolledAsync.mockResolvedValue(true)
		mockedLocalAuth.supportedAuthenticationTypesAsync.mockResolvedValue([1])
		mockedSecureStore.getItemAsync.mockResolvedValue('true')

		const { result } = renderHook(() => useBiometrics())

		await waitFor(() => expect(result.current.isEnabled).toBe(true))

		await act(async () => {
			await result.current.disable()
		})

		expect(mockedSecureStore.deleteItemAsync).toHaveBeenCalledWith('tankmate_biometric_enabled')
		expect(result.current.isEnabled).toBe(false)
	})

	it('should return true from authenticate when biometric not enabled', async () => {
		mockedLocalAuth.hasHardwareAsync.mockResolvedValue(true)
		mockedLocalAuth.isEnrolledAsync.mockResolvedValue(true)
		mockedLocalAuth.supportedAuthenticationTypesAsync.mockResolvedValue([1])
		mockedSecureStore.getItemAsync.mockResolvedValue(null) // not enabled

		const { result } = renderHook(() => useBiometrics())

		await waitFor(() => expect(result.current.isAvailable).toBe(true))

		const passed = await result.current.authenticate()
		expect(passed).toBe(true)
		// Should not prompt since biometric is not enabled
		expect(mockedLocalAuth.authenticateAsync).not.toHaveBeenCalled()
	})
})
