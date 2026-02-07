import { prisma } from '../../app/utils/db.server.ts'

export async function getGalleriesForTank(tankId: string) {
	return prisma.tankGallery.findMany({
		where: { fishTankId: tankId },
		select: {
			id: true,
			title: true,
			description: true,
			imageUrl: true,
			altText: true,
			createdAt: true,
		},
		orderBy: { createdAt: 'desc' },
	})
}

export async function getAllGalleries(userId: string) {
	return prisma.tankGallery.findMany({
		where: { fishTank: { userId } },
		select: {
			id: true,
			title: true,
			description: true,
			fishTankId: true,
			altText: true,
			imageUrl: true,
			createdAt: true,
		},
	})
}

export async function addGalleryImages(
	tankId: string,
	images: Array<{
		imageUrl: string
		title?: string | null
		description?: string | null
		altText?: string | null
	}>,
) {
	return prisma.tankGallery.createMany({
		data: images.map((img) => ({
			fishTankId: tankId,
			imageUrl: img.imageUrl,
			title: img.title || null,
			description: img.description || null,
			altText: img.altText || null,
		})),
	})
}

export async function updateGalleryImage(
	imageId: string,
	userId: string,
	data: { title?: string | null; description?: string | null; altText?: string | null },
) {
	return prisma.tankGallery.update({
		where: { id: imageId, fishTank: { userId } },
		data: {
			title: data.title,
			description: data.description,
			altText: data.altText,
		},
		select: { id: true },
	})
}

export async function deleteGalleryImage(imageId: string, userId: string) {
	return prisma.tankGallery.delete({
		where: { id: imageId, fishTank: { userId } },
	})
}

export async function toggleGalleryPublish(tankId: string, userId: string) {
	const tank = await prisma.fishTank.findFirst({
		where: { id: tankId, userId },
		select: { isGalleryPublished: true },
	})

	if (!tank) return null

	return prisma.fishTank.update({
		where: { id: tankId, userId },
		data: { isGalleryPublished: !tank.isGalleryPublished },
		select: { id: true, isGalleryPublished: true },
	})
}
