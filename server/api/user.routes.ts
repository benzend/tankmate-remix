import { Router } from 'express'
import { z } from 'zod'
import bcrypt from 'bcryptjs'
import { authenticateAPI, getUserId } from './middleware.ts'
import { getUserProfile, checkUsernameAvailable, signOutOtherSessions, deleteAccount } from '../services/auth.service.ts'
import { prisma } from '../../app/utils/db.server.ts'

const router = Router()

router.use(authenticateAPI)

const UpdateProfileSchema = z.object({
	username: z.string().min(3).max(20).optional(),
	name: z.string().min(1).optional(),
})

const ChangePasswordSchema = z.object({
	currentPassword: z.string().min(1),
	newPassword: z.string().min(8),
})

// GET /api/v1/user/me
router.get('/me', async (req, res) => {
	try {
		const userId = getUserId(req)
		const user = await getUserProfile(userId)
		if (!user) {
			return res.status(404).json({ error: 'User not found' })
		}
		return res.json({ user })
	} catch (error) {
		console.error('Get profile error:', error)
		return res.status(500).json({ error: 'Failed to fetch profile' })
	}
})

// PATCH /api/v1/user/me
router.patch('/me', async (req, res) => {
	try {
		const userId = getUserId(req)
		const parsed = UpdateProfileSchema.safeParse(req.body)
		if (!parsed.success) {
			return res.status(400).json({ error: 'Invalid profile data', details: parsed.error.flatten() })
		}

		const { username, name } = parsed.data

		if (username) {
			const available = await checkUsernameAvailable(username, userId)
			if (!available) {
				return res.status(409).json({ error: 'Username already taken' })
			}
		}

		const user = await prisma.user.update({
			where: { id: userId },
			data: {
				...(username && { username: username.toLowerCase() }),
				...(name && { name }),
			},
			select: { id: true, username: true, name: true, email: true },
		})

		return res.json({ user })
	} catch (error) {
		console.error('Update profile error:', error)
		return res.status(500).json({ error: 'Failed to update profile' })
	}
})

// POST /api/v1/user/me/password
router.post('/me/password', async (req, res) => {
	try {
		const userId = getUserId(req)
		const parsed = ChangePasswordSchema.safeParse(req.body)
		if (!parsed.success) {
			return res.status(400).json({ error: 'Invalid password data', details: parsed.error.flatten() })
		}

		const { currentPassword, newPassword } = parsed.data

		// Verify current password
		const userWithPassword = await prisma.user.findUnique({
			where: { id: userId },
			select: { password: { select: { hash: true } } },
		})

		if (!userWithPassword?.password) {
			return res.status(400).json({ error: 'No password set. Use password create endpoint instead.' })
		}

		const isValid = await bcrypt.compare(currentPassword, userWithPassword.password.hash)
		if (!isValid) {
			return res.status(401).json({ error: 'Current password is incorrect' })
		}

		const hash = await bcrypt.hash(newPassword, 10)
		await prisma.user.update({
			where: { id: userId },
			data: { password: { update: { hash } } },
		})

		return res.json({ success: true })
	} catch (error) {
		console.error('Change password error:', error)
		return res.status(500).json({ error: 'Failed to change password' })
	}
})

// GET /api/v1/user/me/connections
router.get('/me/connections', async (req, res) => {
	try {
		const userId = getUserId(req)
		const connections = await prisma.connection.findMany({
			where: { userId },
			select: {
				id: true,
				providerName: true,
				providerId: true,
				createdAt: true,
			},
		})
		return res.json({ connections })
	} catch (error) {
		console.error('Get connections error:', error)
		return res.status(500).json({ error: 'Failed to fetch connections' })
	}
})

// GET /api/v1/user/me/data-export
router.get('/me/data-export', async (req, res) => {
	try {
		const userId = getUserId(req)
		const user = await prisma.user.findUnique({
			where: { id: userId },
			select: {
				id: true,
				email: true,
				username: true,
				name: true,
				createdAt: true,
				image: { select: { id: true } },
				connections: { select: { providerName: true, createdAt: true } },
				roles: { select: { name: true } },
				fishTanks: {
					select: {
						id: true,
						name: true,
						waterType: true,
						volume: true,
						parameterLogs: true,
						fishTankMaintenances: true,
						gallery: { select: { id: true, title: true, imageUrl: true } },
					},
				},
				CoralAnalysis: {
					select: {
						id: true,
						friendlyName: true,
						scientificName: true,
						healthScore: true,
						otherDetails: true,
						imageUrl: true,
					},
				},
			},
		})

		if (!user) {
			return res.status(404).json({ error: 'User not found' })
		}

		res.setHeader('Content-Type', 'application/json')
		res.setHeader('Content-Disposition', `attachment; filename="tankmate-data-${userId}.json"`)
		return res.json(user)
	} catch (error) {
		console.error('Data export error:', error)
		return res.status(500).json({ error: 'Failed to export data' })
	}
})

// POST /api/v1/user/me/sign-out-others
router.post('/me/sign-out-others', async (req, res) => {
	try {
		const userId = getUserId(req)
		const currentSessionId = req.headers.authorization!.slice(7)
		const count = await signOutOtherSessions(userId, currentSessionId)
		return res.json({ success: true, sessionsRevoked: count })
	} catch (error) {
		console.error('Sign out others error:', error)
		return res.status(500).json({ error: 'Failed to sign out other sessions' })
	}
})

// DELETE /api/v1/user/me
router.delete('/me', async (req, res) => {
	try {
		const userId = getUserId(req)
		await deleteAccount(userId)
		return res.json({ success: true })
	} catch (error) {
		console.error('Delete account error:', error)
		return res.status(500).json({ error: 'Failed to delete account' })
	}
})

export default router
