import {
  createUploadthing,
  createRouteHandler,
  type FileRouter,
} from 'uploadthing/remix'
import { UploadThingError } from 'uploadthing/server'
import { requireUserId } from '#app/utils/auth.server.js'

const f = createUploadthing()

const uploadRouter = {
  imageUploader: f({ image: { maxFileSize: '8MB' } })
    .middleware(async ({ event }) => {
      const userId = await requireUserId(event.request)

      if (!userId) throw new UploadThingError('Unauthorized')

      return { userId }
    })
    .onUploadComplete(async ({ metadata, file: _file }) => {
      return { uploadedBy: metadata.userId }
    }),
} satisfies FileRouter

export type UploadRouter = typeof uploadRouter

export const { action, loader } = createRouteHandler({
  router: uploadRouter,
})
