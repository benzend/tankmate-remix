import { requireUserId } from "#app/utils/auth.server.js";
import { prisma } from "#app/utils/db.server.js";
import { updateTank } from "#app/utils/tank.server.js";
import { redirectWithToast } from "#app/utils/toast.server.js";

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
	const body = await request.formData();

  const name = body.get('name') || undefined;
  const waterType = body.get('waterType') || undefined;
  const dimensionsLength = body.get('dimensionsLength') || undefined;
  const dimensionsWidth = body.get('dimensionsWidth') || undefined;
  const dimensionsHeight = body.get('dimensionsHeight') || undefined;
  const imageUrl = body.get('imageUrl') || undefined;
  const volume = body.get('volume') || undefined;

  if (typeof name !== 'undefined' && typeof name !== 'string') {
    throw new Response('name needs to be a string', { status: 400 });
  }

  if (typeof waterType !== 'undefined' && typeof waterType !== 'string') {
    throw new Response('waterType needs to be a string', { status: 400 });
  }

  if (typeof dimensionsLength !== 'undefined' && typeof dimensionsLength !== 'number') {
    throw new Response('dimensionsLength needs to be a number', { status: 400 });
  }

  if (typeof dimensionsWidth !== 'undefined' && typeof dimensionsWidth !== 'number') {
    throw new Response('dimensionsWidth needs to be a number', { status: 400 });
  }

  if (typeof dimensionsHeight !== 'undefined' && typeof dimensionsHeight !== 'number') {
    throw new Response('dimensionsHeight needs to be a number', { status: 400 });
  }

  if (typeof imageUrl !== 'undefined' && typeof imageUrl !== 'string') {
    throw new Response('imageUrl needs to be a string', { status: 400 });
  }

  if (typeof volume !== 'undefined' && typeof volume !== 'number') {
    throw new Response('volume needs to be a number', { status: 400 });
  }

  await prisma.fishTank.update({
    where: { id: tank.id, userId },
    data: {
      name,
      waterType,
      dimensionsLength,
      dimensionsWidth,
      dimensionsHeight,
      imageUrl,
      volume,
    },
    select: {
      id: true,
    },
  });

		return redirectWithToast('/dashboard/tanks/' + tankId, {
			type: 'success',
			title: 'Tank Updated',
			description: `"${tank.name}" has been updated successfully.`,
		})
	} catch (error) {
		console.error('Failed to update tank:', error)
		throw new Response('Failed to update tank. Please try again.', { status: 500 })
	}
}
