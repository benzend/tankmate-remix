import { json, MetaFunction, type LoaderFunctionArgs } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
import { requireUserId } from '#app/utils/auth.server.js'
import { prisma } from '#app/utils/db.server.js'

export const meta: MetaFunction = () => [{ title: 'ReefChronicles | Coral Analysis' }]

export async function loader({ request, params }: LoaderFunctionArgs) {
	const userId = await requireUserId(request, { redirectTo: '/' })

  const coralAnalysis = await prisma.coralAnalysis.findFirst({
		select: {
			id: true,
			friendlyName: true,
			scientificName: true,
      healthScore: true,
      otherDetails: true,
      imageUrl: true,
		},
		where: {
			ownerId: userId,
      id: params.id
		},
	})

	return json({ coralAnalysis })
}

export default function DashboardCoralAnalysesPage() {
	const { coralAnalysis } = useLoaderData<typeof loader>()

	return (
		<div className="w-full">
      <h1 className="text-2xl">{coralAnalysis?.friendlyName}</h1>
      <h2 className="text-sm uppercase text-muted-foreground mb-5">{coralAnalysis?.scientificName}</h2>

      {coralAnalysis?.imageUrl && <img src={coralAnalysis.imageUrl} width="400" height="auto" className="mb-5" />}

      <p>Health Score: {coralAnalysis?.healthScore}</p>
      <p>{coralAnalysis?.otherDetails}</p>
		</div>
	)
}
