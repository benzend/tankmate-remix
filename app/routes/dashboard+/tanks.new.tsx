import { parseWithZod } from '@conform-to/zod'
import {
  type LoaderFunctionArgs,
  type ActionFunctionArgs,
} from '@remix-run/node'
import { Form, json, redirect, useFetcher } from '@remix-run/react'
import { useRef } from 'react'
import { Tooltip } from 'react-tooltip'
import { z } from 'zod'
import { Input } from '#app/components/ui/input.js'
import { type action as cloudinaryAction } from '#app/routes/_image-upload+/cloudinary.tsx'
import { requireUserId } from '#app/utils/auth.server.js'
import { prisma } from '#app/utils/db.server.js'

const WaterEnum = z.enum(['saltwater', 'freshwater'])

const FishTankCreateSchema = z.object({
  name: z.string().optional().default('My fish tank'),
  volume: z.number().optional(),
  waterType: WaterEnum,
  imageUrl: z.string().optional(),
})

export async function action({ request }: ActionFunctionArgs) {
  const userId = await requireUserId(request, { redirectTo: '/' })

  const formData = await request.formData()
  const submission = await parseWithZod(formData, {
    schema: FishTankCreateSchema,
    async: true,
  })

  if (submission.status !== 'success') {
    console.error({ submission, reply: submission.reply() })
    return json(
      { result: submission.reply() },
      { status: submission.status === 'error' ? 400 : 200 },
    )
  }

  const { name, volume, waterType, imageUrl } = submission.value

  const tank = await prisma.fishTank.create({
    data: {
      userId,
      name,
      waterType,
      imageUrl,
      volume, // gallons
    },
    select: {
      id: true,
    },
  })

  return redirect('/dashboard/tanks/' + tank.id)
}

export async function loader({ request }: LoaderFunctionArgs) {
  await requireUserId(request, { redirectTo: '/' })
  return json({ ok: true })
}

export default function NewTank() {
  const imgFetcher = useFetcher<typeof cloudinaryAction>()
  const imgUploadFormRef = useRef<HTMLFormElement | null>(null)

  const handleImageChange = () => {
    let formData = new FormData()

    if (imgUploadFormRef.current) {
      formData = new FormData(imgUploadFormRef.current)
    }

    imgFetcher.submit(formData, {
      method: 'POST',
      action: '/cloudinary',
      encType: 'multipart/form-data',
    })
  }

  const imgData = imgFetcher.data as any

  return (
    <>
      <main className="font-poppins h-full">
        <header>
          <h1 className="text-2xl text-foreground lg:text-4xl">
            Add a New Tank
          </h1>
        </header>
        <div className="mt-10">
          <label className="text-sm text-foreground">
            Upload Image
            <Tooltip id="image-url-tooltip" className="absolute"></Tooltip>
          </label>
          <br />
          <imgFetcher.Form
            action="/cloudinary"
            method="POST"
            encType="multipart/form-data"
            id="image-upload-form"
            className="mt-3 w-80"
            ref={imgUploadFormRef}
          >
            {imgData && (
              <img
                src={imgData.imgSource}
                width="300px"
                height="auto"
                className="mb-4"
                alt="uploaded fish tank"
              />
            )}

            <Input
              name="img"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
            />
            <input
              name="description"
              type="text"
              hidden
              readOnly
              value="Fishtank"
            />
          </imgFetcher.Form>

          <Form method="POST">
            {imgData && (
              <input
                type="text"
                value={imgData.imgSource}
                hidden
                name="imageUrl"
              />
            )}
            <br />
            <label htmlFor="name">Name</label>
            <Input
              id="name"
              name="name"
              type="text"
              placeholder="Living Room Tank"
              className="w-40"
            />
            <br />
            <label htmlFor="volume">Volume (Gallons)</label>
            <Input
              id="volume"
              name="volume"
              type="number"
              placeholder="20"
              className="w-40"
            />
            <br />
            <label htmlFor="waterType">Watertype</label>
            <br />
            <select
              id="waterType"
              name="waterType"
              className="mb-5 w-40 rounded border border-input bg-background px-2 py-2 text-foreground"
            >
              <option value="saltwater">Salt Water</option>
              <option value="freshwater">Fresh Water</option>
            </select>
            <br />

            <button type="submit" className="text-foreground">
              Create
            </button>
          </Form>
        </div>
      </main>
    </>
  )
}
