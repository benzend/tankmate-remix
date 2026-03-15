import { Router } from 'express'
import { z } from 'zod'
import { prisma } from '../../app/utils/db.server.ts'
import { authenticateAPI, getUserId } from './middleware.ts'

const router = Router()

router.use(authenticateAPI)

const RegisterTokenSchema = z.object({
	token: z.string().min(1),
	platform: z.enum(['ios', 'android']),
})

// POST /api/v1/push/register — register a device push token
router.post('/register', async (req, res) => {
	try {
		const userId = getUserId(req)
		const parsed = RegisterTokenSchema.safeParse(req.body)
		if (!parsed.success) {
			return res.status(400).json({ error: 'Invalid token data', details: parsed.error.flatten() })
		}

		const { token, platform } = parsed.data

		// Upsert: if token already exists, update the user association
		await prisma.devicePushToken.upsert({
			where: { token },
			create: { token, platform, userId },
			update: { userId, platform, updatedAt: new Date() },
		})

		return res.json({ success: true })
	} catch (error) {
		console.error('Push token register error:', error)
		return res.status(500).json({ error: 'Failed to register push token' })
	}
})

// DELETE /api/v1/push/unregister — remove a device push token
router.delete('/unregister', async (req, res) => {
	try {
		const userId = getUserId(req)
		const { token } = req.body as { token?: string }

		if (!token) {
			return res.status(400).json({ error: 'Token is required' })
		}

		await prisma.devicePushToken.deleteMany({
			where: { token, userId },
		})

		return res.json({ success: true })
	} catch (error) {
		console.error('Push token unregister error:', error)
		return res.status(500).json({ error: 'Failed to unregister push token' })
	}
})

export default router
