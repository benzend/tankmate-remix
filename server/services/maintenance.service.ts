import { prisma } from '../../app/utils/db.server.ts'

export async function getMaintenanceLogsForTank(tankId: string) {
	return prisma.fishTankMaintenance.findMany({
		where: { fishTankId: tankId },
		select: {
			id: true,
			maintenanceType: true,
			extraDetails: true,
			createdAt: true,
		},
		orderBy: { createdAt: 'desc' },
	})
}

export async function getMaintenanceLog(logId: string) {
	return prisma.fishTankMaintenance.findUnique({
		where: { id: logId },
		select: {
			id: true,
			maintenanceType: true,
			extraDetails: true,
			createdAt: true,
			fishTankId: true,
		},
	})
}

export async function createMaintenanceLog(data: {
	fishTankId: string
	maintenanceType: string
	extraDetails?: string
}) {
	return prisma.fishTankMaintenance.create({
		data: {
			fishTankId: data.fishTankId,
			maintenanceType: data.maintenanceType,
			extraDetails: data.extraDetails || '',
		},
		select: { id: true },
	})
}
