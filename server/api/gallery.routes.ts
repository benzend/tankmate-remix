import { Router } from 'express'
import { z } from 'zod'
import { authenticateAPI, getUserId } from './middleware.ts'
import { verifyTankOwnership } from '../services/tank.service.ts'
import {
	getGalleriesForTank,
	getAllGalleries,
	addGalleryImages,
	updateGalleryImage,
	deleteGalleryImage,
	toggleGalleryPublish,
} from '../services/gallery.service.ts'

const router = Router()

router.use(authenticateAPI)

const AddImagesSchema = z.object({
	images: z.array(
		z.object({
			imageUrl: z.string().url(),
			title: z.string().nullable().optional(),
			description: z.string().nullable().optional(),
			altText: z.string().nullable().optional(),
		}),
	).min(1),
})

const UpdateImageSchema = z.object({
	title: z.string().nullable().optional(),
	description: z.string().nullable().optional(),
	altText: z.string().nullable().optional(),
})

// GET /api/v1/galleries — all galleries for the user
router.get('/', async (req, res) => {
	try {
		const userId = getUserId(req)
		const galleries = await getAllGalleries(userId)
		return res.json({ galleries })
	} catch (error) {
		console.error('Get all galleries error:', error)
		return res.status(500).json({ error: 'Failed to fetch galleries' })
	}
})

// GET /api/v1/tanks/:tankId/gallery
router.get('/tanks/:tankId/gallery', async (req, res) => {
	try {
		const userId = getUserId(req)
		const owns = await verifyTankOwnership(req.params.tankId, userId)
		if (!owns) {
			return res.status(404).json({ error: 'Tank not found' })
		}

		const gallery = await getGalleriesForTank(req.params.tankId)
		return res.json({ gallery })
	} catch (error) {
		console.error('Get gallery error:', error)
		return res.status(500).json({ error: 'Failed to fetch gallery' })
	}
})

// POST /api/v1/tanks/:tankId/gallery
router.post('/tanks/:tankId/gallery', async (req, res) => {
	try {
		const userId = getUserId(req)
		const owns = await verifyTankOwnership(req.params.tankId, userId)
		if (!owns) {
			return res.status(404).json({ error: 'Tank not found' })
		}

		const parsed = AddImagesSchema.safeParse(req.body)
		if (!parsed.success) {
			return res.status(400).json({ error: 'Invalid gallery data', details: parsed.error.flatten() })
		}

		await addGalleryImages(req.params.tankId, parsed.data.images)
		return res.status(201).json({ success: true, count: parsed.data.images.length })
	} catch (error) {
		console.error('Add gallery images error:', error)
		return res.status(500).json({ error: 'Failed to add images' })
	}
})

// PATCH /api/v1/gallery/:id
router.patch('/gallery/:id', async (req, res) => {
	try {
		const userId = getUserId(req)
		const parsed = UpdateImageSchema.safeParse(req.body)
		if (!parsed.success) {
			return res.status(400).json({ error: 'Invalid update data', details: parsed.error.flatten() })
		}

		const image = await updateGalleryImage(req.params.id, userId, parsed.data)
		return res.json({ galleryImage: image })
	} catch (error) {
		console.error('Update gallery image error:', error)
		return res.status(500).json({ error: 'Failed to update image' })
	}
})

// DELETE /api/v1/gallery/:id
router.delete('/gallery/:id', async (req, res) => {
	try {
		const userId = getUserId(req)
		await deleteGalleryImage(req.params.id, userId)
		return res.json({ success: true })
	} catch (error) {
		console.error('Delete gallery image error:', error)
		return res.status(500).json({ error: 'Failed to delete image' })
	}
})

// PATCH /api/v1/tanks/:tankId/gallery/publish
router.patch('/tanks/:tankId/gallery/publish', async (req, res) => {
	try {
		const userId = getUserId(req)
		const result = await toggleGalleryPublish(req.params.tankId, userId)
		if (!result) {
			return res.status(404).json({ error: 'Tank not found' })
		}
		return res.json({ tankId: result.id, isGalleryPublished: result.isGalleryPublished })
	} catch (error) {
		console.error('Toggle publish error:', error)
		return res.status(500).json({ error: 'Failed to toggle gallery publish status' })
	}
})

export default router
