import { invariantResponse } from '@epic-web/invariant'
import { json, MetaFunction, type LoaderFunctionArgs } from '@remix-run/node'
import { Link, useLoaderData, Form } from '@remix-run/react'
import { useState } from 'react'
import { requireUserId } from '#app/utils/auth.server.js'
import { prisma } from '#app/utils/db.server.js'
import { cn, getLatestTankScoreAverage, useDoubleCheck, useIsPending } from '#app/utils/misc.js'
import { Button } from '#app/components/ui/button.js'
import { Icon } from '#app/components/ui/icon.js'


export const meta: MetaFunction = () => [{ title: 'TankMate | Tanks' }]

export async function loader({ request }: LoaderFunctionArgs) {
  const userId = await requireUserId(request, { redirectTo: '/' })

  const user = await prisma.user.findFirst({
    select: {
      id: true,
      username: true,
      name: true,
    },
    where: {
      id: userId,
    },
  })

  invariantResponse(user, 'No user', { status: 404 })

  const tanks = await prisma.fishTank.findMany({
    select: {
      id: true,
      name: true,
      dimensionsWidth: true,
      dimensionsLength: true,
      dimensionsHeight: true,
      imageUrl: true,
      fishTankScores: {
        select: {
          result: true,
          imageUrl: true,
        },
      },
    },
    where: {
      userId,
    },
  })

  const tankMaintenanceLog = await prisma.fishTankMaintenance.findMany({
    select: {
      id: true,
      maintenanceType: true,
      extraDetails: true,
      fishTank: {
        select: {
          name: true,
          id: true,
        },
      },
    },
    where: {
      fishTank: {
        userId,
      },
    },
  })

  const tankParameterLog = await prisma.fishTankParameterLog.findMany({
    select: {
      id: true,
      createdAt: true,
      fishTank: {
        select: {
          name: true,
          id: true,
        }
      }
    },
    where: {
      fishTank: {
        userId
      }
    }
  })

  return json({ user, tanks, tankMaintenanceLog, tankParameterLog })
}

export default function Dashboard() {
  const { tanks } = useLoaderData<typeof loader>()

  return (
    <div className="w-full">
      {tanks.length ? (
        <div>
          <div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {tanks.map((tank) => {
                const image = (() => {
                  if (tank.imageUrl) {
                    return tank.imageUrl
                  } else if (tank.fishTankScores.length) {
                    const tankImageUrls = tank.fishTankScores
                      .map((s) => s.imageUrl)
                      .filter(Boolean)

                    if (!tankImageUrls.length) {
                      return null
                    }

                    return tankImageUrls[tankImageUrls.length - 1]!
                  }
                  return null
                })()

                return (
                  <Tank
                    key={tank.id}
                    name={tank.name}
                    imageUrl={image}
                    tankId={tank.id}
                    score={getLatestTankScoreAverage(tank.fishTankScores as any)}
                  />
                )

              })}
              <Link to="/dashboard/tanks/new">
                <div className="w-full h-full flex justify-center items-center rounded border p-2 bg-foreground text-xs text-background">
                  + Add Tank
                </div>
              </Link>

            </div>

            <div>
            </div>
          </div>
        </div>
      ) : (
        <Link to="/dashboard/tanks/new" className="text-foreground">+ Add your first tank</Link>
      )}
    </div>
  )
}

const Tank = ({
  tankId,
  name,
  imageUrl,
  score,
}: {
  tankId: string
  name: string
  imageUrl: string | null
  score: number
}) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showMobileDelete, setShowMobileDelete] = useState(false)

  return (
    <div
      className="relative group"
      onClick={() => {
        // Hide mobile delete button and delete confirm when clicking elsewhere
        if (showMobileDelete) {
          setShowMobileDelete(false)
        }
        if (showDeleteConfirm) {
          setShowDeleteConfirm(false)
        }
      }}
    >
      <Link to={`/dashboard/tanks/${tankId}`}>
        <div
          className="p-2 border h-full w-full min-h-[130px] relative"
          onTouchStart={() => {
            // Show delete button on long press for mobile
            const timer = setTimeout(() => {
              setShowMobileDelete(true)
            }, 500)

            // Store timer reference to clear on touch end
            const touchEndHandler = () => {
              clearTimeout(timer)
              document.removeEventListener('touchend', touchEndHandler)
            }
            document.addEventListener('touchend', touchEndHandler)
          }}
        >
          {/* Mobile hint - only show on small screens */}
          <div className="absolute bottom-1 left-1 md:hidden">
            <div className="text-xs text-muted-foreground/60 bg-background/80 px-1 py-0.5 rounded">
              Long press for options
            </div>
          </div>
          <h3 className="text-xl mb-2 text-foreground">{name}</h3>
          {imageUrl && (
            <img
              height="100%"
              width="auto"
              className="max-h-[100px] max-w-full"
              src={imageUrl}
              alt={name}
            />
          )}
        </div>
      </Link>

      {/* Delete button - always visible on mobile, hover-only on desktop */}
      <div className={`absolute top-2 right-2 transition-opacity ${showMobileDelete || showDeleteConfirm
          ? 'opacity-100'
          : 'md:opacity-0 md:group-hover:opacity-100'
        }`}>
        <Button
          type="button"
          className="h-8 w-8 p-0 bg-destructive text-destructive-foreground hover:bg-destructive/80 shadow-sm"
          onClick={() => setShowDeleteConfirm(true)}
        >
          <Icon name="trash" className="h-4 w-4" />
        </Button>
      </div>

      {/* Delete confirmation dialog */}
      {/* NOTE: forms don't work if they're within a {boolean && <div>} so we update using the classname of 'hidden' */}
      <div className={cn("absolute inset-0 bg-background/95 rounded border flex items-center justify-center z-10 p-4", {
        'hidden': !showDeleteConfirm
      })}>
        <div className="text-center w-full max-w-xs">
          <div className="mb-4">
            <Icon name="trash" className="h-8 w-8 text-destructive mx-auto mb-2" />
            <p className="text-base font-medium mb-2">Delete "{name}"?</p>
            <p className="text-sm text-muted-foreground">This action cannot be undone.</p>
          </div>
          <Form method="POST" action={`/dashboard/tanks/${tankId}/delete`} className="space-y-3">
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <Button
                type="submit"
                className="flex-1 px-4 py-2.5 text-sm bg-destructive text-destructive-foreground hover:bg-destructive/80 rounded-md min-h-[44px]"
              >
                Delete
              </Button>
              <button
                type="button"
                className="flex-1 px-4 py-2.5 text-sm border border-input bg-background text-foreground hover:bg-accent hover:text-accent-foreground rounded-md min-h-[44px]"
                onClick={() => {
                  setShowDeleteConfirm(false)
                  setShowMobileDelete(false)
                }}
              >
                Cancel
              </button>
            </div>
          </Form>
        </div>
      </div>
    </div>
  )
}
