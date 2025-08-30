import { requireUserId } from '#app/utils/auth.server.js'
import { prisma } from '#app/utils/db.server.js'
import { redirectWithToast } from '#app/utils/toast.server.ts'

export async function action({ request, params }: { request: Request; params: { tankId: string } }) {
	const userId = await requireUserId(request, { redirectTo: '/' })
	const { tankId } = params

	if (!tankId) {
		throw new Response('Tank ID is required', { status: 400 })
	}

	// Verify the tank exists and belongs to the user
	const tank = await prisma.fishTank.findFirst({
		select: { id: true, name: true },
		where: { 
			id: tankId,
			userId 
		},
	})

	if (!tank) {
		throw new Response('Tank not found or access denied', { status: 404 })
	}

	try {
		// Delete the tank (cascade will handle related data)
		await prisma.fishTank.delete({
			where: { id: tankId }
		})

		return redirectWithToast('/dashboard/tanks', {
			type: 'success',
			title: 'Tank Deleted',
			description: `"${tank.name}" has been deleted successfully.`,
		})
	} catch (error) {
		console.error('Failed to delete tank:', error)
		throw new Response('Failed to delete tank. Please try again.', { status: 500 })
	}
}
