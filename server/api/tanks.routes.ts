import { Router } from 'express'
import { z } from 'zod'
import {
	getUserTanks,
	getTankDetail,
	createTank,
	updateTank,
	deleteTank,
} from '../services/tank.service.ts'
import { authenticateAPI, getUserId } from './middleware.ts'

const router = Router()

// All tank routes require authentication
router.use(authenticateAPI)

const CreateTankSchema = z.object({
	name: z.string().optional().default('My fish tank'),
	waterType: z.enum(['saltwater', 'freshwater']),
	imageUrl: z.string().optional(),
	volume: z.number().optional(),
})

const UpdateTankSchema = z.object({
	name: z.string().optional(),
	waterType: z.string().optional(),
	dimensionsLength: z.number().optional(),
	dimensionsWidth: z.number().optional(),
	dimensionsHeight: z.number().optional(),
	imageUrl: z.string().optional(),
	volume: z.number().optional(),
})

// GET /api/v1/tanks
router.get('/', async (req, res) => {
	try {
		const userId = getUserId(req)
		const tanks = await getUserTanks(userId)
		return res.json({ tanks })
	} catch (error) {
		console.error('Get tanks error:', error)
		return res.status(500).json({ error: 'Failed to fetch tanks' })
	}
})

// POST /api/v1/tanks
router.post('/', async (req, res) => {
	try {
		const userId = getUserId(req)
		const parsed = CreateTankSchema.safeParse(req.body)
		if (!parsed.success) {
			return res.status(400).json({ error: 'Invalid tank data', details: parsed.error.flatten() })
		}

		const tank = await createTank(userId, parsed.data)
		return res.status(201).json({ tank })
	} catch (error) {
		console.error('Create tank error:', error)
		return res.status(500).json({ error: 'Failed to create tank' })
	}
})

// GET /api/v1/tanks/:id
router.get('/:id', async (req, res) => {
	try {
		const userId = getUserId(req)
		const tank = await getTankDetail(req.params.id, userId)
		if (!tank) {
			return res.status(404).json({ error: 'Tank not found' })
		}
		return res.json({ tank })
	} catch (error) {
		console.error('Get tank detail error:', error)
		return res.status(500).json({ error: 'Failed to fetch tank' })
	}
})

// PATCH /api/v1/tanks/:id
router.patch('/:id', async (req, res) => {
	try {
		const userId = getUserId(req)
		const parsed = UpdateTankSchema.safeParse(req.body)
		if (!parsed.success) {
			return res.status(400).json({ error: 'Invalid update data', details: parsed.error.flatten() })
		}

		const tank = await updateTank(req.params.id, userId, parsed.data)
		if (!tank) {
			return res.status(404).json({ error: 'Tank not found or access denied' })
		}
		return res.json({ tank })
	} catch (error) {
		console.error('Update tank error:', error)
		return res.status(500).json({ error: 'Failed to update tank' })
	}
})

// DELETE /api/v1/tanks/:id
router.delete('/:id', async (req, res) => {
	try {
		const userId = getUserId(req)
		const tank = await deleteTank(req.params.id, userId)
		if (!tank) {
			return res.status(404).json({ error: 'Tank not found or access denied' })
		}
		return res.json({ success: true, deletedTank: tank.name })
	} catch (error) {
		console.error('Delete tank error:', error)
		return res.status(500).json({ error: 'Failed to delete tank' })
	}
})

export default router
