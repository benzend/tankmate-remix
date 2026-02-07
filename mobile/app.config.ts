import { ExpoConfig, ConfigContext } from 'expo/config'

export default ({ config }: ConfigContext): ExpoConfig => ({
	...config,
	name: 'TankMate',
	slug: 'tankmate',
	version: '1.0.0',
	orientation: 'portrait',
	icon: './assets/icon.png',
	scheme: 'tankmate',
	userInterfaceStyle: 'automatic',
	newArchEnabled: true,
	splash: {
		image: './assets/splash-icon.png',
		resizeMode: 'contain',
		backgroundColor: '#0a1628',
	},
	ios: {
		supportsTablet: true,
		bundleIdentifier: 'com.tankmate.app',
	},
	android: {
		adaptiveIcon: {
			foregroundImage: './assets/adaptive-icon.png',
			backgroundColor: '#0a1628',
		},
		package: 'com.tankmate.app',
	},
	plugins: ['expo-router', 'expo-secure-store', 'expo-camera', 'expo-image-picker'],
	experiments: {
		typedRoutes: true,
	},
	extra: {
		apiUrl: process.env.API_URL || 'http://localhost:8081',
	},
})
