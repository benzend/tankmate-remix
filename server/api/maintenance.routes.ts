import { Router } from 'express'
import { z } from 'zod'
import { authenticateAPI, getUserId } from './middleware.ts'
import { verifyTankOwnership } from '../services/tank.service.ts'
import {
	getMaintenanceLogsForTank,
	getMaintenanceLog,
	createMaintenanceLog,
} from '../services/maintenance.service.ts'

const router = Router()

router.use(authenticateAPI)

const CreateMaintenanceSchema = z.object({
	maintenanceType: z.enum(['water_change', 'filter_change', 'sand_change', 'general', 'custom']),
	extraDetails: z.string().optional().default(''),
})

// GET /api/v1/tanks/:tankId/maintenance
router.get('/tanks/:tankId/maintenance', async (req, res) => {
	try {
		const userId = getUserId(req)
		const owns = await verifyTankOwnership(req.params.tankId, userId)
		if (!owns) {
			return res.status(404).json({ error: 'Tank not found' })
		}

		const logs = await getMaintenanceLogsForTank(req.params.tankId)
		return res.json({ maintenanceLogs: logs })
	} catch (error) {
		console.error('Get maintenance logs error:', error)
		return res.status(500).json({ error: 'Failed to fetch maintenance logs' })
	}
})

// POST /api/v1/tanks/:tankId/maintenance
router.post('/tanks/:tankId/maintenance', async (req, res) => {
	try {
		const userId = getUserId(req)
		const owns = await verifyTankOwnership(req.params.tankId, userId)
		if (!owns) {
			return res.status(404).json({ error: 'Tank not found' })
		}

		const parsed = CreateMaintenanceSchema.safeParse(req.body)
		if (!parsed.success) {
			return res.status(400).json({ error: 'Invalid maintenance data', details: parsed.error.flatten() })
		}

		const log = await createMaintenanceLog({
			fishTankId: req.params.tankId,
			...parsed.data,
		})
		return res.status(201).json({ maintenanceLog: log })
	} catch (error) {
		console.error('Create maintenance log error:', error)
		return res.status(500).json({ error: 'Failed to create maintenance log' })
	}
})

// GET /api/v1/maintenance/:id
router.get('/maintenance/:id', async (req, res) => {
	try {
		const log = await getMaintenanceLog(req.params.id)
		if (!log) {
			return res.status(404).json({ error: 'Maintenance log not found' })
		}
		return res.json({ maintenanceLog: log })
	} catch (error) {
		console.error('Get maintenance log error:', error)
		return res.status(500).json({ error: 'Failed to fetch maintenance log' })
	}
})

export default router
