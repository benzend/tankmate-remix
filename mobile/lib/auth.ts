import * as SecureStore from 'expo-secure-store'

const TOKEN_KEY = 'tankmate_token'
const EXPIRY_KEY = 'tankmate_token_expiry'
const USER_ID_KEY = 'tankmate_user_id'

/**
 * Store auth credentials in the device's secure enclave.
 * iOS: Keychain, Android: Keystore.
 */
export async function storeTokens(token: string, expiresAt: string, userId: string) {
	await Promise.all([
		SecureStore.setItemAsync(TOKEN_KEY, token),
		SecureStore.setItemAsync(EXPIRY_KEY, expiresAt),
		SecureStore.setItemAsync(USER_ID_KEY, userId),
	])
}

export async function getToken(): Promise<string | null> {
	const [token, expiry] = await Promise.all([
		SecureStore.getItemAsync(TOKEN_KEY),
		SecureStore.getItemAsync(EXPIRY_KEY),
	])

	if (!token || !expiry) return null

	// Check if token is expired
	if (new Date(expiry) <= new Date()) {
		await clearTokens()
		return null
	}

	return token
}

export async function getUserId(): Promise<string | null> {
	return SecureStore.getItemAsync(USER_ID_KEY)
}

export async function clearTokens() {
	await Promise.all([
		SecureStore.deleteItemAsync(TOKEN_KEY),
		SecureStore.deleteItemAsync(EXPIRY_KEY),
		SecureStore.deleteItemAsync(USER_ID_KEY),
	])
}

/** Check if we have a non-expired token stored */
export async function hasValidToken(): Promise<boolean> {
	const token = await getToken()
	return token !== null
}
