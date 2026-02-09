import { useEffect, useState, useCallback } from 'react'
import * as LocalAuthentication from 'expo-local-authentication'
import * as SecureStore from 'expo-secure-store'

const BIOMETRIC_ENABLED_KEY = 'reefchronicles_biometric_enabled'

type BiometricState = {
	/** Whether the device has biometric hardware */
	isAvailable: boolean
	/** Whether the user has opted into biometric unlock */
	isEnabled: boolean
	/** The type of biometric (Face ID, fingerprint, etc.) */
	biometricType: string | null
	/** Enable biometric unlock */
	enable: () => Promise<void>
	/** Disable biometric unlock */
	disable: () => Promise<void>
	/** Prompt for biometric authentication, returns true if successful */
	authenticate: () => Promise<boolean>
}

/**
 * Hook for biometric authentication (Face ID / fingerprint).
 * Allows users to unlock the app without re-entering credentials.
 */
export function useBiometrics(): BiometricState {
	const [isAvailable, setIsAvailable] = useState(false)
	const [isEnabled, setIsEnabled] = useState(false)
	const [biometricType, setBiometricType] = useState<string | null>(null)

	useEffect(() => {
		checkBiometrics()
	}, [])

	const checkBiometrics = async () => {
		const compatible = await LocalAuthentication.hasHardwareAsync()
		const enrolled = await LocalAuthentication.isEnrolledAsync()
		setIsAvailable(compatible && enrolled)

		if (compatible && enrolled) {
			const types = await LocalAuthentication.supportedAuthenticationTypesAsync()
			if (types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
				setBiometricType('Face ID')
			} else if (types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
				setBiometricType('Fingerprint')
			} else if (types.includes(LocalAuthentication.AuthenticationType.IRIS)) {
				setBiometricType('Iris')
			}
		}

		const stored = await SecureStore.getItemAsync(BIOMETRIC_ENABLED_KEY)
		setIsEnabled(stored === 'true')
	}

	const enable = useCallback(async () => {
		// Verify biometric works before enabling
		const result = await LocalAuthentication.authenticateAsync({
			promptMessage: 'Verify your identity to enable biometric unlock',
			cancelLabel: 'Cancel',
			disableDeviceFallback: false,
		})

		if (result.success) {
			await SecureStore.setItemAsync(BIOMETRIC_ENABLED_KEY, 'true')
			setIsEnabled(true)
		}
	}, [])

	const disable = useCallback(async () => {
		await SecureStore.deleteItemAsync(BIOMETRIC_ENABLED_KEY)
		setIsEnabled(false)
	}, [])

	const authenticate = useCallback(async (): Promise<boolean> => {
		if (!isAvailable || !isEnabled) return true // Skip if not available/enabled

		const result = await LocalAuthentication.authenticateAsync({
			promptMessage: 'Unlock ReefChronicles',
			cancelLabel: 'Use password',
			disableDeviceFallback: false,
		})

		return result.success
	}, [isAvailable, isEnabled])

	return { isAvailable, isEnabled, biometricType, enable, disable, authenticate }
}
