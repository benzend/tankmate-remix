import { type LoaderFunctionArgs } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
import { prisma } from '#app/utils/db.server.js'

export async function loader({ params }: LoaderFunctionArgs) {
  return await prisma.tankScore.findFirst({ where: { id: params.id } })
}

export default function TanksResultsPage() {
  const data = useLoaderData<typeof loader>()

  if (data?.result) {
    const result = JSON.parse(data.result) as Record<string, any>
    console.log({ result })
    if (typeof result === 'object' && result !== null) {
      const typedResult = result as Record<string, any>
      return (
        <div className="mx-auto max-w-2xl py-16">
          {data?.imageUrl && (
            <img
              src={data.imageUrl}
              alt="fish tank and everything in it"
              className="mb-10"
            />
          )}

          <div className="grid gap-10 sm:grid-cols-2 md:grid-cols-3">
            {Object.keys(typedResult).map((key) => {
              const value = typedResult[key]
              if (
                key === 'fish_health' ||
                key === 'aquarium_health' ||
                key === 'tank_health'
              ) {
                if (typeof value === 'object' && value !== null) {
                  return Object.keys(value).map((key) => {
                    if (value[key]['type'] === 'score') {
                      return (
                        <Health
                          key={key}
                          label={value[key]['label']}
                          score={value[key]['score']}
                          note={value[key]['note']}
                        />
                      )
                    }
                  })
                }
              } else if (key === 'fish_count' || key === 'plant_count') {
                if (typeof value === 'object' && value !== null) {
                  return Object.keys(value).map((key) => {
                    if (value[key]['type'] === 'count') {
                      return (
                        <Count
                          key={key}
                          label={value[key]['label']}
                          count={value[key]['total'] || value[key]['count']}
                        />
                      )
                    }
                  })
                }
              } else if (value['type'] === 'score') {
                return (
                  <Health
                    key={key}
                    label={value['label']}
                    score={value['score']}
                    note={value['note']}
                  />
                )
              }
            })}
          </div>

          <div className="invisible">{data.context}</div>
        </div>
      )
    } else {
      return <div className="mx-auto max-w-xl">Invalid Data</div>
    }
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
  const textColor = (function() {
    if (!score) return ''
    if (score > 9) return 'text-green-400'
    if (score > 8) return 'text-green-200'
    if (score > 7) return 'text-yellow-200'
    if (score > 6) return 'text-yellow-400'
    if (score > 5) return 'text-orange-400'
    if (score > 4) return 'text-orange-500'
    return 'text-red-500'
  })()

  const borderColor = (function() {
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
    <div className={`border-b border-l ${borderColor} rounded p-4`}>
      <div className={`text-7xl italic ${textColor}`}>{score}</div>
      <div className="mb-3 text-sm text-gray-300">{label}</div>
      <div className="text-xs">{note}</div>
    </div>
  )
}

const Count = ({ count, label }: { count: number | null; label: string }) => {
  return (
    <div className={`rounded border-b border-l p-4`}>
      {typeof count === 'number' && <div className="text-7xl italic">{count}</div>}
      {typeof count === 'string' && <div className="text-xl italic mb-4">{count}</div>}
      <div className="mb-3 text-sm text-gray-300">{label}</div>
    </div>
  )
}
