import * as FileSystem from 'expo-file-system'
import { api } from './api'

type UploadResult = {
	url: string
	key: string
	name: string
	size: number
}

/**
 * Upload a local image file to the server (which proxies to UploadThing CDN).
 * Reads the file as base64 and sends it to the upload endpoint.
 */
export async function uploadImage(uri: string, filename?: string): Promise<UploadResult> {
	const base64 = await FileSystem.readAsStringAsync(uri, {
		encoding: FileSystem.EncodingType.Base64,
	})

	// Infer content type from extension
	const ext = uri.split('.').pop()?.toLowerCase() || 'jpg'
	const contentTypeMap: Record<string, string> = {
		jpg: 'image/jpeg',
		jpeg: 'image/jpeg',
		png: 'image/png',
		gif: 'image/gif',
		webp: 'image/webp',
		heic: 'image/heic',
	}
	const contentType = contentTypeMap[ext] || 'image/jpeg'
	const name = filename || `photo-${Date.now()}.${ext}`

	return api<UploadResult>('/upload', {
		method: 'POST',
		body: { base64, filename: name, contentType },
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
			const base64 = await FileSystem.readAsStringAsync(uri, {
				encoding: FileSystem.EncodingType.Base64,
			})
			const ext = uri.split('.').pop()?.toLowerCase() || 'jpg'
			const contentTypeMap: Record<string, string> = {
				jpg: 'image/jpeg',
				jpeg: 'image/jpeg',
				png: 'image/png',
				gif: 'image/gif',
				webp: 'image/webp',
				heic: 'image/heic',
			}
			return {
				base64,
				filename: `photo-${Date.now()}-${Math.random().toString(36).slice(2, 6)}.${ext}`,
				contentType: contentTypeMap[ext] || 'image/jpeg',
			}
		}),
	)

	const result = await api<{ files: Array<UploadResult | { error: string }> }>(
		'/upload/batch',
		{ method: 'POST', body: { files } },
	)

	return result.files
}
