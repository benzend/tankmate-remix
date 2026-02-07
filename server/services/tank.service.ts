import { prisma } from '../../app/utils/db.server.ts'

export async function getUserTanks(userId: string) {
	return prisma.fishTank.findMany({
		select: {
			id: true,
			name: true,
			dimensionsWidth: true,
			dimensionsLength: true,
			dimensionsHeight: true,
			imageUrl: true,
			volume: true,
			waterType: true,
			fishTankScores: {
				select: {
					result: true,
					imageUrl: true,
				},
			},
		},
		where: { userId },
	})
}

export async function getTankDetail(tankId: string, userId: string) {
	return prisma.fishTank.findFirst({
		where: { id: tankId, userId },
		select: {
			id: true,
			name: true,
			fishTankScores: {
				select: {
					id: true,
					result: true,
					imageUrl: true,
				},
			},
			gallery: {
				select: {
					id: true,
					title: true,
					description: true,
					imageUrl: true,
					altText: true,
					createdAt: true,
				},
				orderBy: { createdAt: 'desc' },
			},
			fishTankMaintenances: {
				select: {
					id: true,
					createdAt: true,
					maintenanceType: true,
					extraDetails: true,
				},
			},
			parameterLogs: {
				select: {
					id: true,
					temp: true,
					alk: true,
					calcium: true,
					magnesium: true,
					salinity: true,
					pH: true,
					nitrate: true,
					phosphate: true,
					createdAt: true,
				},
				orderBy: { createdAt: 'asc' },
			},
			imageUrl: true,
			volume: true,
			waterType: true,
		},
	})
}

export async function createTank(
	userId: string,
	data: {
		name?: string
		waterType: string
		imageUrl?: string
		volume?: number
	},
) {
	return prisma.fishTank.create({
		data: {
			userId,
			name: data.name || 'My fish tank',
			waterType: data.waterType,
			imageUrl: data.imageUrl,
			volume: data.volume,
		},
		select: { id: true },
	})
}

export async function updateTank(
	tankId: string,
	userId: string,
	data: {
		name?: string
		waterType?: string
		dimensionsLength?: number
		dimensionsWidth?: number
		dimensionsHeight?: number
		imageUrl?: string
		volume?: number
	},
) {
	// Verify ownership
	const tank = await prisma.fishTank.findFirst({
		where: { id: tankId, userId },
		select: { id: true },
	})
	if (!tank) return null

	return prisma.fishTank.update({
		where: { id: tankId, userId },
		data,
		select: { id: true },
	})
}

export async function deleteTank(tankId: string, userId: string) {
	const tank = await prisma.fishTank.findFirst({
		where: { id: tankId, userId },
		select: { id: true, name: true },
	})
	if (!tank) return null

	await prisma.fishTank.delete({ where: { id: tankId } })
	return tank
}

/** Verify a tank belongs to a user */
export async function verifyTankOwnership(tankId: string, userId: string) {
	const tank = await prisma.fishTank.findFirst({
		where: { id: tankId, userId },
		select: { id: true },
	})
	return !!tank
}
