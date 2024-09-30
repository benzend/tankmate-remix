import { json, type LoaderFunctionArgs, redirect } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
import { requireUserId } from '#app/utils/auth.server.js'
import { prisma } from '#app/utils/db.server.js'

export async function loader({ request, params }: LoaderFunctionArgs) {
	const userId = await requireUserId(request, { redirectTo: '/' })

	const tank = await prisma.fishTank.findFirst({
		select: {
			name: true,
			waterType: true,
		},
		where: {
			userId,
			id: params.id,
		},
	})

	if (!tank) {
		return redirect('/')
	}

	return json({ tank })
}

export default function Tank() {
	const { tank } = useLoaderData<typeof loader>()

	return <div>{tank.name}</div>
}
