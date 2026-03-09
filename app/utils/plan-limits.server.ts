import { prisma } from './db.server.ts'
import { getUserPlan, PLAN_DETAILS, type SubscriptionPlan } from './subscription.server.ts'

export { PLAN_DETAILS }

export async function checkTankLimit(userId: string): Promise<{
	allowed: boolean
	current: number
	limit: number
	plan: SubscriptionPlan
}> {
	const plan = await getUserPlan(userId)
	const limits = PLAN_DETAILS[plan]

	if (limits.tanks === -1) {
		return { allowed: true, current: 0, limit: -1, plan }
	}

	const count = await prisma.fishTank.count({ where: { userId } })
	return {
		allowed: count < limits.tanks,
		current: count,
		limit: limits.tanks,
		plan,
	}
}

export async function checkCoralAnalysisLimit(userId: string): Promise<{
	allowed: boolean
	current: number
	limit: number
	plan: SubscriptionPlan
}> {
	const plan = await getUserPlan(userId)
	const limits = PLAN_DETAILS[plan]

	if (limits.coralAnalysesPerMonth === -1) {
		return { allowed: true, current: 0, limit: -1, plan }
	}

	const startOfMonth = new Date()
	startOfMonth.setDate(1)
	startOfMonth.setHours(0, 0, 0, 0)

	const count = await prisma.coralAnalysis.count({
		where: { ownerId: userId, createdAt: { gte: startOfMonth } },
	})

	return {
		allowed: count < limits.coralAnalysesPerMonth,
		current: count,
		limit: limits.coralAnalysesPerMonth,
		plan,
	}
}

export async function checkGalleryImageLimit(
	userId: string,
	tankId: string,
): Promise<{
	allowed: boolean
	current: number
	limit: number
	plan: SubscriptionPlan
}> {
	const plan = await getUserPlan(userId)
	const limits = PLAN_DETAILS[plan]

	if (limits.galleryImagesPerTank === -1) {
		return { allowed: true, current: 0, limit: -1, plan }
	}

	const count = await prisma.tankGallery.count({
		where: { fishTankId: tankId },
	})

	return {
		allowed: count < limits.galleryImagesPerTank,
		current: count,
		limit: limits.galleryImagesPerTank,
		plan,
	}
}
