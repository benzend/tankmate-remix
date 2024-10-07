import {
  createUploadthing,
  createRouteHandler,
  type FileRouter,
} from 'uploadthing/remix'

const f = createUploadthing()

const uploadRouter = {
  imageUploader: f({ image: { maxFileSize: '8MB' } })
    .middleware(async ({ event: _event }) => {
      return {}
    })
    .onUploadComplete(async ({ metadata: _meta, file: _file }) => {
      return {}
    }),
} satisfies FileRouter

export type UploadRouter = typeof uploadRouter

export const { action, loader } = createRouteHandler({
  router: uploadRouter,
})
