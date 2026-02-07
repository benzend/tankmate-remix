import { type Request, type Response, type NextFunction } from 'express'
import { prisma } from '../../app/utils/db.server.ts'

export type AuthenticatedRequest = Request & { userId: string }

/**
 * Middleware that authenticates API requests via Bearer token.
 * The token is the Prisma Session ID (same one stored in the cookie for web).
 * Mobile clients send it as: Authorization: Bearer <sessionId>
 */
export async function authenticateAPI(
	req: Request,
	res: Response,
	next: NextFunction,
) {
	const authHeader = req.headers.authorization
	if (!authHeader?.startsWith('Bearer ')) {
		return res.status(401).json({ error: 'Missing or invalid Authorization header' })
	}

	const sessionId = authHeader.slice(7) // Remove "Bearer "
	if (!sessionId) {
		return res.status(401).json({ error: 'Missing session token' })
	}

	try {
		const session = await prisma.session.findUnique({
			select: { user: { select: { id: true } } },
			where: { id: sessionId, expirationDate: { gt: new Date() } },
		})

		if (!session?.user) {
			return res.status(401).json({ error: 'Invalid or expired session' })
		}

		;(req as AuthenticatedRequest).userId = session.user.id
		next()
	} catch (error) {
		console.error('API auth error:', error)
		return res.status(500).json({ error: 'Authentication failed' })
	}
}

/**
 * Helper to get userId from an authenticated request.
 * Must be used after authenticateAPI middleware.
 */
export function getUserId(req: Request): string {
	return (req as AuthenticatedRequest).userId
}
