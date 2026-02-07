import { Router } from 'express'
import { z } from 'zod'
import {
	loginUser,
	signupUser,
	logoutSession,
	refreshSession,
	checkUsernameAvailable,
	checkEmailAvailable,
} from '../services/auth.service.ts'
import { authenticateAPI, getUserId } from './middleware.ts'

const router = Router()

const LoginSchema = z.object({
	username: z.string().min(1),
	password: z.string().min(1),
})

const SignupSchema = z.object({
	email: z.string().email(),
	username: z.string().min(3).max(20),
	password: z.string().min(8),
	name: z.string().min(1),
})

// POST /api/v1/auth/login
router.post('/login', async (req, res) => {
	try {
		const parsed = LoginSchema.safeParse(req.body)
		if (!parsed.success) {
			return res.status(400).json({ error: 'Invalid credentials format', details: parsed.error.flatten() })
		}

		const session = await loginUser(parsed.data)
		if (!session) {
			return res.status(401).json({ error: 'Invalid username or password' })
		}

		return res.json({
			token: session.id,
			expiresAt: session.expirationDate.toISOString(),
			userId: session.userId,
		})
	} catch (error) {
		console.error('Login error:', error)
		return res.status(500).json({ error: 'Login failed' })
	}
})

// POST /api/v1/auth/signup
router.post('/signup', async (req, res) => {
	try {
		const parsed = SignupSchema.safeParse(req.body)
		if (!parsed.success) {
			return res.status(400).json({ error: 'Invalid signup data', details: parsed.error.flatten() })
		}

		const { email, username, password, name } = parsed.data

		// Check availability
		const [usernameAvailable, emailAvailable] = await Promise.all([
			checkUsernameAvailable(username),
			checkEmailAvailable(email),
		])

		if (!usernameAvailable) {
			return res.status(409).json({ error: 'Username already taken' })
		}
		if (!emailAvailable) {
			return res.status(409).json({ error: 'Email already in use' })
		}

		const session = await signupUser({ email, username, password, name })

		return res.status(201).json({
			token: session.id,
			expiresAt: session.expirationDate.toISOString(),
			userId: session.userId,
		})
	} catch (error) {
		console.error('Signup error:', error)
		return res.status(500).json({ error: 'Signup failed' })
	}
})

// POST /api/v1/auth/logout (authenticated)
router.post('/logout', authenticateAPI, async (req, res) => {
	try {
		const token = req.headers.authorization!.slice(7)
		await logoutSession(token)
		return res.json({ success: true })
	} catch (error) {
		console.error('Logout error:', error)
		return res.status(500).json({ error: 'Logout failed' })
	}
})

// POST /api/v1/auth/refresh (authenticated)
router.post('/refresh', authenticateAPI, async (req, res) => {
	try {
		const token = req.headers.authorization!.slice(7)
		const session = await refreshSession(token)
		if (!session) {
			return res.status(401).json({ error: 'Session not found or expired' })
		}

		return res.json({
			token: session.id,
			expiresAt: session.expirationDate.toISOString(),
			userId: session.userId,
		})
	} catch (error) {
		console.error('Refresh error:', error)
		return res.status(500).json({ error: 'Session refresh failed' })
	}
})

export default router
