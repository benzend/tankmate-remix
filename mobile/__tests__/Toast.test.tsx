/**
 * Tests for the Toast notification system.
 * Verifies toast context, show/hide, and variant rendering.
 *
 * Run with: npx jest __tests__/Toast.test.tsx
 */

import { describe, it, expect, jest, beforeEach } from '@jest/globals'
import { render, fireEvent } from '@testing-library/react-native'
import React from 'react'

// Mock dependencies
jest.mock('react-native-safe-area-context', () => ({
	useSafeAreaInsets: () => ({ top: 44, bottom: 34, left: 0, right: 0 }),
}))

jest.mock('expo-haptics', () => ({
	notificationAsync: jest.fn(),
	NotificationFeedbackType: {
		Success: 'success',
		Error: 'error',
	},
}))

jest.mock('@expo/vector-icons', () => ({
	Ionicons: 'Ionicons',
}))

// Minimal mock for Animated to avoid timer issues
jest.useFakeTimers()

describe('ToastProvider', () => {
	beforeEach(() => {
		jest.clearAllMocks()
	})

	it('should render children', () => {
		const { ToastProvider } = require('../components/ui/Toast')
		const { Text } = require('react-native')

		const { getByText } = render(
			React.createElement(ToastProvider, null,
				React.createElement(Text, null, 'App Content')
			)
		)

		expect(getByText('App Content')).toBeTruthy()
	})

	it('should throw when useToast is used outside provider', () => {
		const { useToast } = require('../components/ui/Toast')
		const { Text } = require('react-native')

		function BadComponent() {
			useToast()
			return React.createElement(Text, null, 'Bad')
		}

		expect(() => render(React.createElement(BadComponent))).toThrow(
			'useToast must be used within ToastProvider',
		)
	})

	it('should show toast with success message', () => {
		const { ToastProvider, useToast } = require('../components/ui/Toast')
		const { Text, Pressable } = require('react-native')

		let toastRef: any

		function TestChild() {
			toastRef = useToast()
			return React.createElement(
				Pressable,
				{ testID: 'trigger', onPress: () => toastRef.success('Saved!') },
				React.createElement(Text, null, 'Trigger')
			)
		}

		const { getByTestId, getByText } = render(
			React.createElement(ToastProvider, null,
				React.createElement(TestChild)
			)
		)

		fireEvent.press(getByTestId('trigger'))

		expect(getByText('Saved!')).toBeTruthy()
	})

	it('should show error toast', () => {
		const { ToastProvider, useToast } = require('../components/ui/Toast')
		const { Text, Pressable } = require('react-native')

		let toastRef: any

		function TestChild() {
			toastRef = useToast()
			return React.createElement(
				Pressable,
				{ testID: 'trigger', onPress: () => toastRef.error('Failed!') },
				React.createElement(Text, null, 'Trigger')
			)
		}

		const { getByTestId, getByText } = render(
			React.createElement(ToastProvider, null,
				React.createElement(TestChild)
			)
		)

		fireEvent.press(getByTestId('trigger'))

		expect(getByText('Failed!')).toBeTruthy()
	})

	it('should trigger haptic feedback on show', () => {
		const Haptics = require('expo-haptics')
		const { ToastProvider, useToast } = require('../components/ui/Toast')
		const { Text, Pressable } = require('react-native')

		let toastRef: any

		function TestChild() {
			toastRef = useToast()
			return React.createElement(
				Pressable,
				{ testID: 'trigger', onPress: () => toastRef.success('Done') },
				React.createElement(Text, null, 'Trigger')
			)
		}

		const { getByTestId } = render(
			React.createElement(ToastProvider, null,
				React.createElement(TestChild)
			)
		)

		fireEvent.press(getByTestId('trigger'))

		expect(Haptics.notificationAsync).toHaveBeenCalledWith('success')
	})

	it('should trigger error haptic for error toast', () => {
		const Haptics = require('expo-haptics')
		const { ToastProvider, useToast } = require('../components/ui/Toast')
		const { Text, Pressable } = require('react-native')

		let toastRef: any

		function TestChild() {
			toastRef = useToast()
			return React.createElement(
				Pressable,
				{ testID: 'trigger', onPress: () => toastRef.error('Oops') },
				React.createElement(Text, null, 'Trigger')
			)
		}

		const { getByTestId } = render(
			React.createElement(ToastProvider, null,
				React.createElement(TestChild)
			)
		)

		fireEvent.press(getByTestId('trigger'))

		expect(Haptics.notificationAsync).toHaveBeenCalledWith('error')
	})
})
