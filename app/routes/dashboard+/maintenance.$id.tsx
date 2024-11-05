import {
	type ActionFunctionArgs,
	type LoaderFunctionArgs,
} from '@remix-run/node'
import {
	json,
	redirect,
	useLoaderData,
	Link,
	useSubmit,
	useActionData,
} from '@remix-run/react'
import { useEffect, useState } from 'react'
import { requireUserId } from '#app/utils/auth.server.js'
import { prisma } from '#app/utils/db.server.js'
import { DateFrom, humanize, toTitleCase } from '#app/utils/misc.js'

export async function loader({ request, params }: LoaderFunctionArgs) {
	const userId = await requireUserId(request, { redirectTo: '/' })

	const maintenanceLog = await prisma.fishTankMaintenance.findFirst({
		where: { id: params.id, fishTank: { userId } },
		select: {
			id: true,
			extraDetails: true,
			maintenanceType: true,
      createdAt: true,
      fishTank: {
        select: {
          id: true,
          name: true,
        }
      }
		},
	})

	if (!maintenanceLog) {
		return redirect('/dashboard')
	}

	return json({ maintenanceLog })
}

export default function TankPage() {
	const { maintenanceLog } = useLoaderData<typeof loader>()

	return (
		<div>
			<header>
				<label className="text-xs text-foreground">Maintenance Log</label>
				<div className="mb-10">
					<h1 className="font-bold text-foreground md:text-2xl lg:text-left lg:text-3xl inline mr-4">
						{toTitleCase(humanize(maintenanceLog.maintenanceType))}
					</h1>
          <time>{DateFrom(maintenanceLog.createdAt).toLocaleDateString()} | {DateFrom(maintenanceLog.createdAt).toLocaleTimeString()}</time>
				</div>
        {maintenanceLog.extraDetails ?? null}
			</header>
		</div>
	)
}
