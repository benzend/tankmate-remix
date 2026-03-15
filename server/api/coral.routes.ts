import { Router } from 'express'
import { z } from 'zod'
import {
	getCoralAnalyses,
	getCoralAnalysis,
	analyzeCoralImage,
} from '../services/coral.service.ts'
import { authenticateAPI, getUserId } from './middleware.ts'

const router = Router()

router.use(authenticateAPI)

const AnalyzeSchema = z.object({
	imageUrl: z.string().url(),
	fishTankId: z.string().optional(),
})

// GET /api/v1/coral-analyses
router.get('/', async (req, res) => {
	try {
		const userId = getUserId(req)
		const analyses = await getCoralAnalyses(userId)
		return res.json({ coralAnalyses: analyses })
	} catch (error) {
		console.error('Get coral analyses error:', error)
		return res.status(500).json({ error: 'Failed to fetch coral analyses' })
	}
})

// POST /api/v1/coral-analyses
router.post('/', async (req, res) => {
	try {
		const userId = getUserId(req)
		const parsed = AnalyzeSchema.safeParse(req.body)
		if (!parsed.success) {
			return res.status(400).json({ error: 'Invalid analysis data', details: parsed.error.flatten() })
		}

		const analysis = await analyzeCoralImage(
			userId,
			parsed.data.imageUrl,
			parsed.data.fishTankId,
		)
		return res.status(201).json({ coralAnalysis: analysis })
	} catch (error) {
		console.error('Coral analysis error:', error)
		return res.status(500).json({ error: 'Failed to analyze coral image' })
	}
})

// GET /api/v1/coral-analyses/:id
router.get('/:id', async (req, res) => {
	try {
		const userId = getUserId(req)
		const analysis = await getCoralAnalysis(req.params.id, userId)
		if (!analysis) {
			return res.status(404).json({ error: 'Coral analysis not found' })
		}
		return res.json({ coralAnalysis: analysis })
	} catch (error) {
		console.error('Get coral analysis error:', error)
		return res.status(500).json({ error: 'Failed to fetch coral analysis' })
	}
})

export default router
