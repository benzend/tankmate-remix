import * as FileSystem from 'expo-file-system'
import * as ImageManipulator from 'expo-image-manipulator'
import { api } from './api'

type UploadResult = {
	url: string
	key: string
	name: string
	size: number
}

const MAX_DIMENSION = 1920
const COMPRESS_QUALITY = 0.8

/**
 * Resize and compress an image to JPEG before upload.
 * Returns the URI of the compressed file.
 */
async function compressImage(uri: string): Promise<string> {
	const result = await ImageManipulator.manipulateAsync(
		uri,
		[{ resize: { width: MAX_DIMENSION } }],
		{ compress: COMPRESS_QUALITY, format: ImageManipulator.SaveFormat.JPEG },
	)
	return result.uri
}

/**
 * Upload a local image file to the server (which proxies to UploadThing CDN).
 * Compresses the image, reads as base64, and sends to the upload endpoint.
 */
export async function uploadImage(uri: string, filename?: string): Promise<UploadResult> {
	const compressed = await compressImage(uri)
	const base64 = await FileSystem.readAsStringAsync(compressed, {
		encoding: FileSystem.EncodingType.Base64,
	})

	const name = filename || `photo-${Date.now()}.jpg`

	return api<UploadResult>('/upload', {
		method: 'POST',
		body: { base64, filename: name, contentType: 'image/jpeg' },
	})
}

/**
 * Upload multiple local image files in a single request.
 */
export async function uploadImages(
	uris: string[],
): Promise<Array<UploadResult | { error: string }>> {
	const files = await Promise.all(
		uris.map(async (uri) => {
			const compressed = await compressImage(uri)
			const base64 = await FileSystem.readAsStringAsync(compressed, {
				encoding: FileSystem.EncodingType.Base64,
			})
			return {
				base64,
				filename: `photo-${Date.now()}-${Math.random().toString(36).slice(2, 6)}.jpg`,
				contentType: 'image/jpeg',
			}
		}),
	)

	const result = await api<{ files: Array<UploadResult | { error: string }> }>(
		'/upload/batch',
		{ method: 'POST', body: { files } },
	)

	return result.files
}
