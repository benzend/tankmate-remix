import { type LoaderFunctionArgs, type MetaFunction } from '@remix-run/node'
import { json, Link, useLoaderData } from '@remix-run/react'
import { prisma } from '#app/utils/db.server.js'
import { formatDateBasedOnRecency } from '#app/utils/misc.js'
import { Icon } from '#app/components/ui/icon.tsx'

export async function loader({ request }: LoaderFunctionArgs) {
  // Fetch all published galleries with tank and user information
  const publishedGalleries = await prisma.tankGallery.findMany({
    where: {
      fishTank: {
        isGalleryPublished: true,
      },
    },
    select: {
      id: true,
      title: true,
      description: true,
      altText: true,
      imageUrl: true,
      createdAt: true,
      fishTank: {
        select: {
          id: true,
          name: true,
          waterType: true,
          volume: true,
          user: {
            select: {
              id: true,
              username: true,
              name: true,
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  })

  // Group galleries by tank
  const tankGalleries = publishedGalleries.reduce((acc, gallery) => {
    const tankId = gallery.fishTank.id
    if (!acc[tankId]) {
      acc[tankId] = {
        tank: gallery.fishTank,
        images: [],
      }
    }
    acc[tankId].images.push(gallery)
    return acc
  }, {} as Record<string, { tank: any; images: any[] }>)

  return json({ tankGalleries: Object.values(tankGalleries) })
}

export const meta: MetaFunction = () => [
  { title: 'TankMate | Community Galleries' },
  { 
    name: 'description', 
    content: 'Explore aquarium galleries from the TankMate community. Discover inspiring tank setups and aquascaping ideas.' 
  },
]

export default function PublicGalleriesPage() {
  const { tankGalleries } = useLoaderData<typeof loader>()

  return (
    <div className="container mx-auto px-4 py-8">
      <header className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-foreground mb-4">Community Galleries</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Discover inspiring aquarium setups from the TankMate community. Browse tank galleries and get ideas for your next aquascape.
        </p>
      </header>

      {tankGalleries.length === 0 ? (
        <div className="text-center py-16">
          <Icon name="camera" className="mx-auto mb-4 h-16 w-16 text-muted-foreground/50" />
          <h2 className="text-2xl font-semibold text-foreground mb-2">No Public Galleries Yet</h2>
          <p className="text-muted-foreground mb-6">
            Be the first to share your aquarium with the community!
          </p>
          <Link
            to="/login"
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-md hover:bg-primary/90 transition-colors"
          >
            <Icon name="plus" className="h-4 w-4" />
            Join TankMate
          </Link>
        </div>
      ) : (
        <div className="space-y-12">
          {tankGalleries.map(({ tank, images }) => (
            <div key={tank.id} className="bg-card rounded-lg border p-6">
              {/* Tank Header */}
              <div className="mb-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-semibold text-foreground">{tank.name}</h2>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                      <span>by {tank.user.name || tank.user.username}</span>
                      {tank.volume && <span>{tank.volume}L</span>}
                      <span className="capitalize">{tank.waterType}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full">
                      <Icon name="check" className="h-3 w-3" />
                      {images.length} image{images.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                </div>
              </div>

              {/* Image Grid */}
              <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
                {images.map((image) => (
                  <div key={image.id} className="group relative overflow-hidden rounded-lg border bg-muted">
                    <div className="aspect-square">
                      <img
                        src={image.imageUrl}
                        alt={image.altText || image.title || `${tank.name} aquarium`}
                        className="h-full w-full object-cover transition-transform group-hover:scale-105"
                      />
                    </div>

                    {/* Image Info Overlay */}
                    {(image.title || image.description) && (
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                          {image.title && (
                            <h3 className="font-semibold mb-1 text-sm">{image.title}</h3>
                          )}
                          {image.description && (
                            <p className="text-xs text-gray-200 mb-2 line-clamp-2">{image.description}</p>
                          )}
                          <p className="text-xs text-gray-300">
                            {formatDateBasedOnRecency(new Date(image.createdAt).toLocaleDateString())}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Call to Action */}
      <div className="mt-16 text-center">
        <div className="bg-muted/50 rounded-lg p-8">
          <h2 className="text-2xl font-semibold text-foreground mb-4">Share Your Aquarium</h2>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Join the TankMate community and showcase your aquarium setup to inspire others.
          </p>
          <Link
            to="/login"
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-md hover:bg-primary/90 transition-colors"
          >
            <Icon name="plus" className="h-4 w-4" />
            Get Started
          </Link>
        </div>
      </div>
    </div>
  )
}
