import { Router } from 'express'
import { searchReefTank } from '../services/search.service.ts'
import { authenticateAPI } from './middleware.ts'

const router = Router()

router.use(authenticateAPI)

// GET /api/v1/search?q=...
router.get('/', async (req, res) => {
	try {
		const query = req.query.q as string | undefined
		if (!query) {
			return res.json({ results: [] })
		}

		const results = await searchReefTank(query)
		return res.json({ results })
	} catch (error) {
		console.error('Search error:', error)
		return res.json({
			results: [
				{
					title: "Sorry, I couldn't process that request.",
					url: null,
					content: null,
				},
			],
		})
	}
})

export default router
