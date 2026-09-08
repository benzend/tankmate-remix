import { parseWithZod } from '@conform-to/zod'
import {
  type LoaderFunctionArgs,
  type ActionFunctionArgs,
  MetaFunction,
} from '@remix-run/node'
import { Form, json, redirect, useFetcher } from '@remix-run/react'
import { useRef, useState } from 'react'
import { Tooltip } from 'react-tooltip'
import { z } from 'zod'
import { Input } from '#app/components/ui/input.js'
import { type action as cloudinaryAction } from '#app/routes/_image-upload+/cloudinary.tsx'
import { requireUserId } from '#app/utils/auth.server.js'
import { prisma } from '#app/utils/db.server.js'
import { Button } from '#app/components/ui/button.js'
import { UploadButton } from '#app/utils/uploadthing.js'

export const meta: MetaFunction = () => [{ title: 'ReefChronicles | New Tank' }]

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
  const [imgUrl, setImgUrl] = useState<string>('');

  return (
    <>
      <main className="font-poppins h-full">
        <header>
          <h1 className="text-2xl text-foreground lg:text-4xl">
            Add a New Tank
          </h1>
        </header>
        <div className="mt-10">
          <label className="text-foreground">
            Upload Image
            <Tooltip id="image-url-tooltip" className="absolute"></Tooltip>
          </label>
          <br />
          <UploadButton
            className="w-full md:w-40 mt-2 mb-5"
            appearance={{
              button: 'w-full text-sm font-medium'
            }}
            endpoint='imageUploader'
            onClientUploadComplete={(data) => {
              setImgUrl(data[0]?.url || '');
              alert('Upload complete!');
            }}
            onUploadError={(error) => {
              console.log("onUploadError", error);
              alert('Upload error!');
            }}
            content={{ button: '+ Add Image' }}
          />

          {imgUrl && (
            <img
              src={imgUrl}
              width="300px"
              height="auto"
              className="mb-4"
              alt="uploaded fish tank"
            />
          )}

          <input
            name="description"
            type="text"
            hidden
            readOnly
            value="Fishtank"
          />

          <Form method="POST">
            {imgUrl && (
              <input
                type="text"
                value={imgUrl}
                hidden
                name="imageUrl"
              />
            )}
            <br />
            <label htmlFor="name" className="text-foreground">Name</label>
            <Input
              id="name"
              name="name"
              type="text"
              placeholder="Living Room Tank"
              className="w-full md:w-40"
            />
            <br />
            <label htmlFor="volume" className="text-foreground">Volume (Gallons)</label>
            <Input
              id="volume"
              name="volume"
              type="number"
              placeholder="20"
              className="w-full md:w-40"
            />
            <br />
            <label htmlFor="waterType" className="text-foreground">Watertype</label>
            <br />
            <select
              id="waterType"
              name="waterType"
              className="mb-5 w-full md:w-40 rounded border border-input bg-background px-2 py-2 text-foreground"
            >
              <option value="saltwater">Salt Water</option>
              <option value="freshwater">Fresh Water</option>
            </select>
            <br />

            <div className="mobile-fixed-action">
              <Button type="submit" className="w-full md:w-20">
                Create
              </Button>
            </div>
          </Form>
        </div>
      </main>
    </>
  )
}
