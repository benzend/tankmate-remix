/**
 * Tests for the biometric authentication hook.
 * Verifies hardware detection, enable/disable, and authentication flow.
 *
 * Run with: npx jest __tests__/useBiometrics.test.ts
 */

import { describe, it, expect, jest, beforeEach } from '@jest/globals'
import { renderHook, act, waitFor } from '@testing-library/react-native'

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

describe('useBiometrics', () => {
	beforeEach(() => {
		jest.clearAllMocks()
		jest.resetModules()
	})

	it('should detect Face ID availability', async () => {
		const LocalAuth = require('expo-local-authentication')
		const SecureStore = require('expo-secure-store')

		LocalAuth.hasHardwareAsync.mockResolvedValue(true)
		LocalAuth.isEnrolledAsync.mockResolvedValue(true)
		LocalAuth.supportedAuthenticationTypesAsync.mockResolvedValue([1]) // FACIAL_RECOGNITION
		SecureStore.getItemAsync.mockResolvedValue(null)

		const { useBiometrics } = require('../hooks/useBiometrics')
		const { result } = renderHook(() => useBiometrics())

		await waitFor(() => {
			expect(result.current.isAvailable).toBe(true)
		})

		expect(result.current.biometricType).toBe('Face ID')
		expect(result.current.isEnabled).toBe(false)
	})

	it('should detect fingerprint availability', async () => {
		const LocalAuth = require('expo-local-authentication')
		const SecureStore = require('expo-secure-store')

		LocalAuth.hasHardwareAsync.mockResolvedValue(true)
		LocalAuth.isEnrolledAsync.mockResolvedValue(true)
		LocalAuth.supportedAuthenticationTypesAsync.mockResolvedValue([2]) // FINGERPRINT
		SecureStore.getItemAsync.mockResolvedValue(null)

		const { useBiometrics } = require('../hooks/useBiometrics')
		const { result } = renderHook(() => useBiometrics())

		await waitFor(() => {
			expect(result.current.isAvailable).toBe(true)
		})

		expect(result.current.biometricType).toBe('Fingerprint')
	})

	it('should report unavailable when no hardware', async () => {
		const LocalAuth = require('expo-local-authentication')
		const SecureStore = require('expo-secure-store')

		LocalAuth.hasHardwareAsync.mockResolvedValue(false)
		LocalAuth.isEnrolledAsync.mockResolvedValue(false)
		SecureStore.getItemAsync.mockResolvedValue(null)

		const { useBiometrics } = require('../hooks/useBiometrics')
		const { result } = renderHook(() => useBiometrics())

		await waitFor(() => {
			expect(result.current.isAvailable).toBe(false)
		})
	})

	it('should read enabled state from secure store', async () => {
		const LocalAuth = require('expo-local-authentication')
		const SecureStore = require('expo-secure-store')

		LocalAuth.hasHardwareAsync.mockResolvedValue(true)
		LocalAuth.isEnrolledAsync.mockResolvedValue(true)
		LocalAuth.supportedAuthenticationTypesAsync.mockResolvedValue([1])
		SecureStore.getItemAsync.mockResolvedValue('true')

		const { useBiometrics } = require('../hooks/useBiometrics')
		const { result } = renderHook(() => useBiometrics())

		await waitFor(() => {
			expect(result.current.isEnabled).toBe(true)
		})
	})

	it('should enable biometric after successful verification', async () => {
		const LocalAuth = require('expo-local-authentication')
		const SecureStore = require('expo-secure-store')

		LocalAuth.hasHardwareAsync.mockResolvedValue(true)
		LocalAuth.isEnrolledAsync.mockResolvedValue(true)
		LocalAuth.supportedAuthenticationTypesAsync.mockResolvedValue([1])
		LocalAuth.authenticateAsync.mockResolvedValue({ success: true })
		SecureStore.getItemAsync.mockResolvedValue(null)

		const { useBiometrics } = require('../hooks/useBiometrics')
		const { result } = renderHook(() => useBiometrics())

		await waitFor(() => expect(result.current.isAvailable).toBe(true))

		await act(async () => {
			await result.current.enable()
		})

		expect(SecureStore.setItemAsync).toHaveBeenCalledWith('tankmate_biometric_enabled', 'true')
		expect(result.current.isEnabled).toBe(true)
	})

	it('should disable biometric', async () => {
		const LocalAuth = require('expo-local-authentication')
		const SecureStore = require('expo-secure-store')

		LocalAuth.hasHardwareAsync.mockResolvedValue(true)
		LocalAuth.isEnrolledAsync.mockResolvedValue(true)
		LocalAuth.supportedAuthenticationTypesAsync.mockResolvedValue([1])
		SecureStore.getItemAsync.mockResolvedValue('true')

		const { useBiometrics } = require('../hooks/useBiometrics')
		const { result } = renderHook(() => useBiometrics())

		await waitFor(() => expect(result.current.isEnabled).toBe(true))

		await act(async () => {
			await result.current.disable()
		})

		expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith('tankmate_biometric_enabled')
		expect(result.current.isEnabled).toBe(false)
	})

	it('should return true from authenticate when biometric not enabled', async () => {
		const LocalAuth = require('expo-local-authentication')
		const SecureStore = require('expo-secure-store')

		LocalAuth.hasHardwareAsync.mockResolvedValue(true)
		LocalAuth.isEnrolledAsync.mockResolvedValue(true)
		LocalAuth.supportedAuthenticationTypesAsync.mockResolvedValue([1])
		SecureStore.getItemAsync.mockResolvedValue(null) // not enabled

		const { useBiometrics } = require('../hooks/useBiometrics')
		const { result } = renderHook(() => useBiometrics())

		await waitFor(() => expect(result.current.isAvailable).toBe(true))

		const passed = await result.current.authenticate()
		expect(passed).toBe(true)
		// Should not prompt since biometric is not enabled
		expect(LocalAuth.authenticateAsync).not.toHaveBeenCalled()
	})
})
