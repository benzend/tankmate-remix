/**
 * Tests for the image upload utility.
 * Verifies base64 encoding, content type detection, and API calls.
 *
 * Run with: npx jest __tests__/upload.test.ts
 */

import { describe, it, expect, jest, beforeEach } from '@jest/globals'

// Mock expo-file-system
jest.mock('expo-file-system', () => ({
	readAsStringAsync: jest.fn(),
	EncodingType: { Base64: 'base64' },
}))

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

const mockFetch = jest.fn() as jest.MockedFunction<typeof fetch>
global.fetch = mockFetch

describe('uploadImage', () => {
	beforeEach(() => {
		jest.clearAllMocks()
		jest.resetModules()

		const SecureStore = require('expo-secure-store')
		SecureStore.getItemAsync.mockImplementation((key: string) => {
			if (key === 'tankmate_token') return Promise.resolve('test-token')
			if (key === 'tankmate_token_expiry') return Promise.resolve(new Date(Date.now() + 86400000).toISOString())
			return Promise.resolve(null)
		})
	})

	it('should read file as base64 and upload', async () => {
		const FileSystem = require('expo-file-system')
		FileSystem.readAsStringAsync.mockResolvedValue('base64-image-data')

		mockFetch.mockResolvedValueOnce({
			ok: true,
			status: 200,
			json: () => Promise.resolve({
				url: 'https://cdn.uploadthing.com/image.jpg',
				key: 'abc123',
				name: 'photo.jpg',
				size: 12345,
			}),
		} as Response)

		const { uploadImage } = require('../lib/upload')
		const result = await uploadImage('file:///tmp/photo.jpg')

		expect(FileSystem.readAsStringAsync).toHaveBeenCalledWith(
			'file:///tmp/photo.jpg',
			{ encoding: 'base64' },
		)

		expect(result.url).toBe('https://cdn.uploadthing.com/image.jpg')
		expect(result.key).toBe('abc123')
	})

	it('should use custom filename when provided', async () => {
		const FileSystem = require('expo-file-system')
		FileSystem.readAsStringAsync.mockResolvedValue('base64-data')

		mockFetch.mockResolvedValueOnce({
			ok: true,
			status: 200,
			json: () => Promise.resolve({
				url: 'https://cdn.uploadthing.com/coral.jpg',
				key: 'def456',
				name: 'coral-analysis.jpg',
				size: 8000,
			}),
		} as Response)

		const { uploadImage } = require('../lib/upload')
		await uploadImage('file:///tmp/photo.jpg', 'coral-analysis.jpg')

		const body = JSON.parse(mockFetch.mock.calls[0]?.[1]?.body as string)
		expect(body.filename).toBe('coral-analysis.jpg')
	})

	it('should detect content type from file extension', async () => {
		const FileSystem = require('expo-file-system')
		FileSystem.readAsStringAsync.mockResolvedValue('base64-data')

		mockFetch.mockResolvedValueOnce({
			ok: true,
			status: 200,
			json: () => Promise.resolve({ url: 'url', key: 'key', name: 'n', size: 1 }),
		} as Response)

		const { uploadImage } = require('../lib/upload')
		await uploadImage('file:///tmp/photo.png')

		const body = JSON.parse(mockFetch.mock.calls[0]?.[1]?.body as string)
		expect(body.contentType).toBe('image/png')
	})
})

describe('uploadImages', () => {
	beforeEach(() => {
		jest.clearAllMocks()
		jest.resetModules()

		const SecureStore = require('expo-secure-store')
		SecureStore.getItemAsync.mockImplementation((key: string) => {
			if (key === 'tankmate_token') return Promise.resolve('test-token')
			if (key === 'tankmate_token_expiry') return Promise.resolve(new Date(Date.now() + 86400000).toISOString())
			return Promise.resolve(null)
		})
	})

	it('should upload multiple images in a batch', async () => {
		const FileSystem = require('expo-file-system')
		FileSystem.readAsStringAsync.mockResolvedValue('base64-data')

		mockFetch.mockResolvedValueOnce({
			ok: true,
			status: 200,
			json: () => Promise.resolve({
				files: [
					{ url: 'https://cdn.uploadthing.com/1.jpg', key: 'k1', name: 'n1', size: 100 },
					{ url: 'https://cdn.uploadthing.com/2.jpg', key: 'k2', name: 'n2', size: 200 },
				],
			}),
		} as Response)

		const { uploadImages } = require('../lib/upload')
		const results = await uploadImages([
			'file:///tmp/photo1.jpg',
			'file:///tmp/photo2.jpg',
		])

		expect(results).toHaveLength(2)
		expect(results[0]).toHaveProperty('url')

		const body = JSON.parse(mockFetch.mock.calls[0]?.[1]?.body as string)
		expect(body.files).toHaveLength(2)
	})
})
