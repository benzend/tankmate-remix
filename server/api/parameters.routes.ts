import { Router } from 'express'
import { z } from 'zod'
import { authenticateAPI, getUserId } from './middleware.ts'
import { verifyTankOwnership } from '../services/tank.service.ts'
import {
	getParameterLogsForTank,
	getParameterLog,
	createParameterLog,
} from '../services/parameter.service.ts'

const router = Router()

router.use(authenticateAPI)

const CreateParameterLogSchema = z.object({
	fishTankId: z.string(),
	calcium: z.number().nullable().optional(),
	alk: z.number().nullable().optional(),
	magnesium: z.number().nullable().optional(),
	pH: z.number().nullable().optional(),
	temp: z.number().nullable().optional(),
	nitrate: z.number().nullable().optional(),
	phosphate: z.number().nullable().optional(),
	salinity: z.number().nullable().optional(),
	createdAt: z.string().optional(),
})

// GET /api/v1/tanks/:tankId/parameters
router.get('/tanks/:tankId/parameters', async (req, res) => {
	try {
		const userId = getUserId(req)
		const owns = await verifyTankOwnership(req.params.tankId, userId)
		if (!owns) {
			return res.status(404).json({ error: 'Tank not found' })
		}

		const logs = await getParameterLogsForTank(req.params.tankId)
		return res.json({ parameterLogs: logs })
	} catch (error) {
		console.error('Get parameter logs error:', error)
		return res.status(500).json({ error: 'Failed to fetch parameter logs' })
	}
})

// POST /api/v1/tanks/:tankId/parameters
router.post('/tanks/:tankId/parameters', async (req, res) => {
	try {
		const userId = getUserId(req)
		const owns = await verifyTankOwnership(req.params.tankId, userId)
		if (!owns) {
			return res.status(404).json({ error: 'Tank not found' })
		}

		const parsed = CreateParameterLogSchema.safeParse({
			...req.body,
			fishTankId: req.params.tankId,
		})
		if (!parsed.success) {
			return res.status(400).json({ error: 'Invalid parameter data', details: parsed.error.flatten() })
		}

		const log = await createParameterLog({
			...parsed.data,
			createdAt: parsed.data.createdAt ? new Date(parsed.data.createdAt) : undefined,
		})
		return res.status(201).json({ parameterLog: log })
	} catch (error) {
		console.error('Create parameter log error:', error)
		return res.status(500).json({ error: 'Failed to create parameter log' })
	}
})

// GET /api/v1/parameters/:id
router.get('/parameters/:id', async (req, res) => {
	try {
		const log = await getParameterLog(req.params.id)
		if (!log) {
			return res.status(404).json({ error: 'Parameter log not found' })
		}
		return res.json({ parameterLog: log })
	} catch (error) {
		console.error('Get parameter log error:', error)
		return res.status(500).json({ error: 'Failed to fetch parameter log' })
	}
})

export default router
