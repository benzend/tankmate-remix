import { requireUserId } from "#app/utils/auth.server.js";

import { createRouteHandler, createUploadthing, type FileRouter } from "uploadthing/remix";
import { UploadThingError } from "uploadthing/server";

const f = createUploadthing();

// FileRouter for your app, can contain multiple FileRoutes
const uploadRouter = {
  // Single image uploader for tank main images
  imageUploader: f({
    image: {
      maxFileSize: "8MB",
      maxFileCount: 1,
    },
  })
    .middleware(async ({ event }) => {
      const userId = await requireUserId(event.request);
      if (!userId) throw new UploadThingError("Unauthorized");
      return { userId };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Upload complete for userId:", metadata.userId);
      console.log("file url", file.url);
      return { uploadedBy: metadata.userId };
    }),

  // Gallery image uploader with multiple file support
  galleryUploader: f({
    image: {
      maxFileSize: "8MB",
      maxFileCount: 10, // Allow multiple images for gallery
    },
  })
    .middleware(async ({ event }) => {
      const userId = await requireUserId(event.request);
      if (!userId) throw new UploadThingError("Unauthorized");
      return { userId };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Gallery upload complete for userId:", metadata.userId);
      console.log("file url", file.url);
      return { uploadedBy: metadata.userId };
    }),

  // Profile image uploader
  profileUploader: f({
    image: {
      maxFileSize: "8MB",
      maxFileCount: 1,
    },
  })
    .middleware(async ({ event }) => {
      const userId = await requireUserId(event.request);
      if (!userId) throw new UploadThingError("Unauthorized");
      return { userId };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Profile upload complete for userId:", metadata.userId);
      console.log("file url", file.url);
      return { uploadedBy: metadata.userId };
    }),
} satisfies FileRouter;

export type UploadRouter = typeof uploadRouter;

const routeHandler = createRouteHandler({ router: uploadRouter })

export const action = routeHandler.action
export const loader = routeHandler.loader
