import { prisma } from '../../app/utils/db.server.ts'

export async function getParameterLogsForTank(tankId: string) {
	return prisma.fishTankParameterLog.findMany({
		where: { fishTankId: tankId },
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
	})
}

export async function getParameterLog(logId: string) {
	return prisma.fishTankParameterLog.findUnique({
		where: { id: logId },
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
			fishTankId: true,
		},
	})
}

export async function createParameterLog(data: {
	fishTankId: string
	calcium?: number | null
	alk?: number | null
	magnesium?: number | null
	pH?: number | null
	temp?: number | null
	nitrate?: number | null
	phosphate?: number | null
	salinity?: number | null
	createdAt?: Date
}) {
	return prisma.fishTankParameterLog.create({
		data: {
			fishTankId: data.fishTankId,
			calcium: data.calcium ?? null,
			alk: data.alk ?? null,
			magnesium: data.magnesium ?? null,
			pH: data.pH ?? null,
			temp: data.temp ?? null,
			nitrate: data.nitrate ?? null,
			phosphate: data.phosphate ?? null,
			salinity: data.salinity ?? null,
			createdAt: data.createdAt ?? new Date(),
		},
		select: { id: true },
	})
}
