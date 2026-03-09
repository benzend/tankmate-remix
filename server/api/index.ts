import { Router } from 'express'
import authRoutes from './auth.routes.ts'
import tanksRoutes from './tanks.routes.ts'
import parametersRoutes from './parameters.routes.ts'
import maintenanceRoutes from './maintenance.routes.ts'
import coralRoutes from './coral.routes.ts'
import galleryRoutes from './gallery.routes.ts'
import userRoutes from './user.routes.ts'
import searchRoutes from './search.routes.ts'
import pushRoutes from './push.routes.ts'
import uploadRoutes from './upload.routes.ts'
import subscriptionRoutes from './subscription.routes.ts'

const apiRouter = Router()

// Auth (unauthenticated + authenticated routes)
apiRouter.use('/auth', authRoutes)

// Tanks CRUD
apiRouter.use('/tanks', tanksRoutes)

// Parameter logs (nested under tanks + standalone)
apiRouter.use('/', parametersRoutes)

// Maintenance logs (nested under tanks + standalone)
apiRouter.use('/', maintenanceRoutes)

// Coral analyses
apiRouter.use('/coral-analyses', coralRoutes)

// Gallery (nested under tanks + standalone)
apiRouter.use('/', galleryRoutes)

// User profile & settings
apiRouter.use('/user', userRoutes)

// Search
apiRouter.use('/search', searchRoutes)

// Push notifications
apiRouter.use('/push', pushRoutes)

// Image uploads (mobile — base64 → UploadThing CDN)
apiRouter.use('/upload', uploadRoutes)

// Subscription management
apiRouter.use('/subscription', subscriptionRoutes)

export default apiRouter
