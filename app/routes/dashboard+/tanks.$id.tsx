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

export async function action({ request, params }: ActionFunctionArgs) {
  const userId = await requireUserId(request, { redirectTo: '/' })
  const data = await request.formData()

  const tank = await prisma.fishTank.findFirst({
    where: { id: params.id, userId },
    select: {
      id: true,
    },
  })

  if (!tank) {
    return redirect('/dashboard')
  }

  const name = data.get('name')

  if (typeof name !== 'string') {
    return json({
      error: `name (${String(name)}) isnt a valid string`,
      success: false,
    })
  }

  if (!name) {
    return json({ error: `name is an empty string`, success: false })
  }

  try {
    await prisma.fishTank.update({
      where: { id: tank.id, userId },
      data: {
        name,
      },
    })
  } catch {
    return json({ error: 'failed to update tank name', success: false })
  }

  return json({ error: null, success: true })
}

export async function loader({ request, params }: LoaderFunctionArgs) {
  const userId = await requireUserId(request, { redirectTo: '/' })

  const tank = await prisma.fishTank.findFirst({
    where: { id: params.id, userId },
    select: {
      id: true,
      name: true,
      fishTankScores: {
        select: {
          id: true,
          result: true,
        },
      },
    },
  })

  if (!tank) {
    return redirect('/dashboard')
  }

  return json({ tank })
}

export default function TankPage() {
  const actionData = useActionData<typeof action>()

  const { tank } = useLoaderData<typeof loader>()

  const [editName, setEditName] = useState(tank.name)
  const [editingName, setEditingName] = useState(false)

  const submit = useSubmit()

  const handleEditTankNameClick = () => {
    setEditingName(true)
  }

  const handleCancelEditTankNameClick = () => {
    setEditingName(false)
  }

  const handleInputNameChange = (e: React.FormEvent<HTMLInputElement>) => {
    setEditName(e.currentTarget.value)
  }

  const handleSaveTankNameClick = () => {
    const formData = new FormData()
    formData.append('name', editName)
    submit(formData, { method: 'POST' })
  }

  useEffect(() => {
    if (actionData?.success) {
      setEditingName(false)
    }
  }, [actionData])

  return (
    <div>
      <header>
        <div className="mb-5">
          <Link to="/dashboard" className="text-slate-400">
            Back to Dash
          </Link>
        </div>
        {editingName ? (
          <div>
            <label className="text-xs text-slate-300">Tank Name</label>
            <br />
            <input
              type="text"
              value={editName}
              onChange={handleInputNameChange}
              className="mb-10 mr-4 rounded border-white bg-slate-800 px-2 py-2 text-center text-base font-bold outline-white md:text-lg lg:text-left lg:text-2xl"
            />
            <button className="mr-4" onClick={handleSaveTankNameClick}>
              Save
            </button>
            <button
              className="text-red-300"
              onClick={handleCancelEditTankNameClick}
            >
              Cancel
            </button>
          </div>
        ) : (
          <>
            <label className="text-xs text-slate-300">Tank Name</label>
            <div className="mb-10 flex gap-4 align-baseline">
              <h1 className="cursor-pointer text-center text-base font-bold md:text-2xl lg:text-left lg:text-3xl">
                {tank.name}
              </h1>
              <button
                className="text-slate-300"
                onClick={handleEditTankNameClick}
              >
                Edit
              </button>
            </div>
          </>
        )}
      </header>
      {tank.fishTankScores.map((score) => (
        <TankScore key={score.id} data={score} />
      ))}
    </div>
  )
}

const TankScore = ({ data }: { data: any }) => {
  if (data?.result) {
    const result = JSON.parse(data.result) as Record<string, any>
    if (typeof result === 'object' && result !== null) {
      const typedResult = result as Record<string, any>
      return (
        <div>
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
      <div className={`md:text-5xl lg:text-7xl italic ${textColor}`}>{score}</div>
      <div className="mb-3 text-sm font-bold">{label}</div>
      <div className="text-xs">{note}</div>
    </div>
  )
}

const Count = ({ count, label }: { count: number | null; label: string }) => {
  return (
    <div className={`rounded border-b border-l p-4`}>
      {typeof count === 'number' && (
        <div className="md:text-5xl lg:text-7xl italic">{count}</div>
      )}
      {typeof count === 'string' && (
        <div className="mb-4 text-xl italic">{count}</div>
      )}
      <div className="mb-3 text-sm text-gray-300">{label}</div>
    </div>
  )
}
