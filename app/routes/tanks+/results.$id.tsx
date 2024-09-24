import { type LoaderFunctionArgs } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
import { PretterPrintJson } from '#app/components/ui/pretty-print-json.js'
import { prisma } from '#app/utils/db.server.js'

export async function loader({ params }: LoaderFunctionArgs) {
	return await prisma.tankScore.findFirst({ where: { id: params.id } })
}

export default function TanksResultsPage() {
	const data = useLoaderData<typeof loader>()

	if (data?.result) {
		const result = JSON.parse(data.result) as Record<string, any>
    console.log({ result });
		return (
			<div className="mx-auto max-w-xl">
				{data?.imageUrl && (
					<img src={data.imageUrl} alt="fish tank and everything in it" className="mb-10" />
				)}

				<div className="grid grid-cols-2 gap-10">
					<Health
						label="Fish Health"
						score={result['fish_health']['score']}
						note={result['fish_health']['note']}
					/>

					<Health
						label="Plant Health"
						score={result['plant_health']['score']}
						note={result['plant_health']['note']}
					/>

					<Health
						label="Water Health"
						score={result['water_health']['score']}
						note={result['water_health']['note']}
					/>

					<Health
						label="Coral Health"
						score={result['coral_health']['score']}
						note={result['coral_health']['note']}
					/>

					<Health
						label="Sand Health"
						score={result['sand_health']['score']}
						note={result['sand_health']['note']}
					/>
				</div>
			</div>
		)
	} else {
		return <div className="mx-auto max-w-xl">No data</div>
	}
}

const Health = ({
	note,
	score,
	label,
}: {
	note: string
	score: number | null
	label: string
}) => {
	const textColor = (function () {
		if (!score) return ''
		if (score > 9) return 'text-green-400'
		if (score > 8) return 'text-green-200'
		if (score > 7) return 'text-yellow-200'
		if (score > 6) return 'text-yellow-400'
		if (score > 5) return 'text-orange-400'
		if (score > 4) return 'text-orange-500'
		return 'text-red-500'
	})()

	const borderColor = (function () {
		if (!score) return ''
		if (score > 9) return 'border-green-400'
		if (score > 8) return 'border-green-200'
		if (score > 7) return 'border-yellow-200'
		if (score > 6) return 'border-yellow-400'
		if (score > 5) return 'border-orange-400'
		if (score > 4) return 'border-orange-500'
		return 'border-red-500'
	})()

	return (
		<div className={`border-b border-l ${borderColor} rounded p-10`}>
			<div className={`text-7xl italic ${textColor}`}>{score}</div>
			<div className="mb-3 text-sm text-gray-300">{label}</div>
			<div className="text-sm">{note}</div>
		</div>
	)
}
