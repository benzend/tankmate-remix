import { json, MetaFunction, type LoaderFunctionArgs } from '@remix-run/node'
import { Link, useLoaderData } from '@remix-run/react'
import { requireUserId } from '#app/utils/auth.server.js'
import { prisma } from '#app/utils/db.server.js'

export const meta: MetaFunction = () => [{ title: 'TankMate | Coral Analyses' }]

export async function loader({ request }: LoaderFunctionArgs) {
	const userId = await requireUserId(request, { redirectTo: '/' })

  const coralAnalyses = await prisma.coralAnalysis.findMany({
		select: {
			id: true,
			friendlyName: true,
			scientificName: true,
      healthScore: true,
      otherDetails: true,
		},
		where: {
			ownerId: userId,
		},
	})

	return json({ coralAnalyses })
}

export default function DashboardCoralAnalysesPage() {
	const { coralAnalyses } = useLoaderData<typeof loader>()

	return (
		<div className="w-full">
			{coralAnalyses.length ? (
				<div className="flex flex-wrap">
					<div className="m-2 w-full sm:w-80">
						<header className="rounded-t border p-4 text-foreground">
							Coral Analyses
						</header>
						<div className="rounded-b border-b border-l border-r">
							{coralAnalyses.map((analysis) => (
								<Analysis
                  key={analysis.id}
                  id={analysis.id}
                  friendlyName={analysis.friendlyName}
                  scientificName={analysis.scientificName}
                  otherDetails={analysis.otherDetails || ''}
                  healthScore={analysis.healthScore}
								/>
							))}
						</div>
						<div>
							<Link to="/dashboard/coral-analyses/new">
								<div className="w-40 rounded-b border border-t-0 p-2 text-xs text-foreground">
									+ Analyze
								</div>
							</Link>
						</div>
					</div>

				</div>
			) : (
				<Link className="text-foreground" to="/dashboard/coral-analyses/new">+ Analyze</Link>
			)}
		</div>
	)
}

const Analysis = ({
  id,
	friendlyName,
	scientificName,
  healthScore,
  otherDetails
}: {
  id: string,
  friendlyName: string,
  scientificName: string,
  healthScore: number,
  otherDetails: string
}) => {
	const borderColor = (function () {
		if (!healthScore) return ''
		if (healthScore > 9) return 'border-l-positive-green'
		if (healthScore > 8) return 'border-l-positive-green'
		if (healthScore > 7) return 'border-l-neutral-yellow'
		if (healthScore > 6) return 'border-l-neutral-yellow'
		if (healthScore > 5) return 'border-l-negative-red'
		if (healthScore > 4) return 'border-l-negative-red'
		return 'border-l-red-500'
	})()

	return (
		<div>
			<Link to={`/dashboard/coral-analyses/${id}`}>
				<div
					className={`border-b border-l p-2 text-sm text-accent-foreground ${borderColor}`}
				>
					{friendlyName}
				</div>
			</Link>
		</div>
	)
}
