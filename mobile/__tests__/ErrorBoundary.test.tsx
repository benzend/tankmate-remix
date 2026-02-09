/**
 * Tests for the ErrorBoundary component.
 *
 * Run with: npx jest __tests__/ErrorBoundary.test.tsx
 */

import { describe, it, expect, jest, beforeEach } from '@jest/globals'
import { render, fireEvent } from '@testing-library/react-native'
import React from 'react'

// Mock the Ionicons
jest.mock('@expo/vector-icons', () => ({
	Ionicons: 'Ionicons',
}))

// Suppress console.error from ErrorBoundary catch
const originalConsoleError = console.error
beforeEach(() => {
	console.error = jest.fn()
})
afterEach(() => {
	console.error = originalConsoleError
})

function ThrowingComponent({ shouldThrow }: { shouldThrow: boolean }) {
	if (shouldThrow) {
		throw new Error('Test error')
	}
	const { Text } = require('react-native')
	return React.createElement(Text, null, 'Working fine')
}

describe('ErrorBoundary', () => {
	it('should render children when no error', () => {
		const { ErrorBoundary } = require('../components/ui/ErrorBoundary')
		const { Text } = require('react-native')

		const { getByText } = render(
			React.createElement(ErrorBoundary, null,
				React.createElement(Text, null, 'Child content')
			)
		)

		expect(getByText('Child content')).toBeTruthy()
	})

	it('should show fallback UI when child throws', () => {
		const { ErrorBoundary } = require('../components/ui/ErrorBoundary')

		const { getByText } = render(
			React.createElement(ErrorBoundary, null,
				React.createElement(ThrowingComponent, { shouldThrow: true })
			)
		)

		expect(getByText('Something went wrong')).toBeTruthy()
		expect(getByText('An unexpected error occurred. Please try again.')).toBeTruthy()
		expect(getByText('Try Again')).toBeTruthy()
	})

	it('should show custom fallback when provided', () => {
		const { ErrorBoundary } = require('../components/ui/ErrorBoundary')
		const { Text } = require('react-native')

		const customFallback = React.createElement(Text, null, 'Custom error UI')

		const { getByText } = render(
			React.createElement(ErrorBoundary, { fallback: customFallback },
				React.createElement(ThrowingComponent, { shouldThrow: true })
			)
		)

		expect(getByText('Custom error UI')).toBeTruthy()
	})

	it('should reset error state when Try Again is pressed', () => {
		const { ErrorBoundary } = require('../components/ui/ErrorBoundary')

		// We need a component that throws once then stops
		let throwCount = 0
		function ConditionalThrow() {
			throwCount++
			if (throwCount === 1) {
				throw new Error('First render error')
			}
			const { Text } = require('react-native')
			return React.createElement(Text, null, 'Recovered')
		}

		const { getByText } = render(
			React.createElement(ErrorBoundary, null,
				React.createElement(ConditionalThrow)
			)
		)

		// Should show error state
		expect(getByText('Something went wrong')).toBeTruthy()

		// Press Try Again
		fireEvent.press(getByText('Try Again'))

		// Should re-render without error
		expect(getByText('Recovered')).toBeTruthy()
	})

	it('should log error to console', () => {
		const { ErrorBoundary } = require('../components/ui/ErrorBoundary')

		render(
			React.createElement(ErrorBoundary, null,
				React.createElement(ThrowingComponent, { shouldThrow: true })
			)
		)

		expect(console.error).toHaveBeenCalled()
	})
})
