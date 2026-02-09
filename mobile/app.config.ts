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
		infoPlist: {
			NSCameraUsageDescription:
				'TankMate uses your camera to take photos of your aquarium and coral.',
			NSPhotoLibraryUsageDescription:
				'TankMate accesses your photo library to upload aquarium images to your tank gallery.',
			NSFaceIDUsageDescription:
				'TankMate uses Face ID to securely unlock the app.',
		},
	},
	android: {
		adaptiveIcon: {
			foregroundImage: './assets/adaptive-icon.png',
			backgroundColor: '#0a1628',
		},
		package: 'com.tankmate.app',
	},
	plugins: [
		'expo-router',
		'expo-secure-store',
		'expo-camera',
		'expo-image-picker',
		'expo-font',
		[
			'expo-notifications',
			{
				icon: './assets/notification-icon.png',
				color: '#3b82f6',
			},
		],
	],
	experiments: {
		typedRoutes: true,
	},
	extra: {
		apiUrl: process.env.API_URL || 'http://192.168.0.198:3002',
		eas: {
			projectId: process.env.EAS_PROJECT_ID,
		},
	},
})
