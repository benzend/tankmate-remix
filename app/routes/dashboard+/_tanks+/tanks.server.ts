import { json, redirect } from '@remix-run/node'
import { z } from 'zod'
import { parseWithZod } from '@conform-to/zod'
import { requireUserId } from '#app/utils/auth.server.js'
import { prisma } from '#app/utils/db.server.js'
import { redirectWithToast } from '#app/utils/toast.server.js'

const DeleteTankSchema = z.object({
	intent: z.literal('delete-tank'),
	tankId: z.string(),
})

export async function action({ request }: { request: Request }) {
	const userId = await requireUserId(request, { redirectTo: '/' })
	const formData = await request.formData()
	
	const submission = parseWithZod(formData, {
		schema: DeleteTankSchema,
	})
	
	if (submission.status !== 'success') {
		return json(
			{ result: submission.reply() },
			{ status: submission.status === 'error' ? 400 : 200 },
		)
	}

	const { tankId } = submission.value

	// Verify the tank exists and belongs to the user
	const tank = await prisma.fishTank.findFirst({
		select: { id: true, name: true },
		where: { 
			id: tankId,
			userId 
		},
	})

	if (!tank) {
		return json(
			{ result: { error: 'Tank not found or access denied' } },
			{ status: 404 }
		)
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
		return json(
			{ result: { error: 'Failed to delete tank. Please try again.' } },
			{ status: 500 }
		)
	}
}
