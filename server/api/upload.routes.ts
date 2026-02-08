import { Router } from 'express'
import { z } from 'zod'
import { UTApi } from 'uploadthing/server'
import { authenticateAPI, getUserId } from './middleware.ts'

const router = Router()
const utapi = new UTApi()

router.use(authenticateAPI)

const UploadSchema = z.object({
	/** Base64-encoded image data (without data URI prefix) */
	base64: z.string().min(1),
	/** Original filename */
	filename: z.string().min(1),
	/** MIME type */
	contentType: z.string().regex(/^image\//),
})

const UploadBatchSchema = z.object({
	files: z.array(UploadSchema).min(1).max(10),
})

// POST /api/v1/upload — upload a single image
router.post('/', async (req, res) => {
	try {
		const userId = getUserId(req)
		const parsed = UploadSchema.safeParse(req.body)
		if (!parsed.success) {
			return res.status(400).json({ error: 'Invalid upload data', details: parsed.error.flatten() })
		}

		const { base64, filename, contentType } = parsed.data

		// Convert base64 to a File-like blob for UTApi
		const buffer = Buffer.from(base64, 'base64')
		const file = new File([buffer], filename, { type: contentType })

		const response = await utapi.uploadFiles(file)

		if (response.error) {
			console.error('UploadThing error:', response.error)
			return res.status(500).json({ error: 'Upload failed' })
		}

		return res.json({
			url: response.data.ufsUrl || response.data.url,
			key: response.data.key,
			name: response.data.name,
			size: response.data.size,
		})
	} catch (error) {
		console.error('Upload error:', error)
		return res.status(500).json({ error: 'Upload failed' })
	}
})

// POST /api/v1/upload/batch — upload multiple images
router.post('/batch', async (req, res) => {
	try {
		const userId = getUserId(req)
		const parsed = UploadBatchSchema.safeParse(req.body)
		if (!parsed.success) {
			return res.status(400).json({ error: 'Invalid upload data', details: parsed.error.flatten() })
		}

		const files = parsed.data.files.map(({ base64, filename, contentType }) => {
			const buffer = Buffer.from(base64, 'base64')
			return new File([buffer], filename, { type: contentType })
		})

		const responses = await utapi.uploadFiles(files)

		const results = responses.map((r) => {
			if (r.error) {
				return { error: r.error.message }
			}
			return {
				url: r.data.ufsUrl || r.data.url,
				key: r.data.key,
				name: r.data.name,
				size: r.data.size,
			}
		})

		return res.json({ files: results })
	} catch (error) {
		console.error('Batch upload error:', error)
		return res.status(500).json({ error: 'Batch upload failed' })
	}
})

export default router
