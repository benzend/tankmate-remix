import { Button } from '#app/components/ui/button.js'
import { Input } from '#app/components/ui/input.js'
import { requireUserId } from '#app/utils/auth.server.js'
import { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node'
import { Form, json, redirect, useFetcher } from '@remix-run/react'
import { useRef } from 'react'
import { Tooltip } from 'react-tooltip'
import { type action as cloudinaryAction } from '#app/routes/_image-upload+/cloudinary.tsx'
import { z } from 'zod'
import { parseWithZod } from '@conform-to/zod'
import { prisma } from '#app/utils/db.server.js'
import { ChatCompletionContentPart } from 'openai/resources/index.mjs'
import OpenAI from 'openai'
import { tryJsonParse } from '#app/utils/misc.js'

const client = new OpenAI({
  apiKey: process.env['OPENAI_API_KEY'], // This is the default and can be omitted
})

const CoralAnalysisNewSchema = z.object({
  imageUrl: z.string(),
})

const ChatResponseSchema = z.object({
  friendlyName: z.string(),
  scientificName: z.string(),
  healthScore: z.number(),
  otherDetails: z.string(),
})

export async function action({ request }: ActionFunctionArgs) {
  const userId = await requireUserId(request, { redirectTo: '/' })

  const formData = await request.formData()
  const submission = parseWithZod(formData, {
    schema: CoralAnalysisNewSchema,
  })

  if (submission.status !== 'success') {
    console.error({ submission, reply: submission.reply() })
    return json(
      { result: submission.reply() },
      { status: submission.status === 'error' ? 400 : 200 },
    )
  }

  const { imageUrl } = submission.value

  const content: Array<ChatCompletionContentPart> = [
    {
      type: 'text',
      text: `Analyze this coral image and provide details in the following JSON format. For healthScore, use a scale of 1-10 where 10 is perfectly healthy. Keep otherDetails brief (max 2 sentences) focusing on distinctive features and any visible health concerns.

\`\`\`json
{
  "friendlyName": "",
  "scientificName": "",
  "healthScore": 0,
  "otherDetails": ""
}
\`\`\`
`,
    },
    { type: 'image_url', image_url: { url: imageUrl } },
  ]

  const chatResponse = await client.chat.completions.create({
    response_format: { type: 'json_object' },
    messages: [{ role: 'user', content }],
    model: 'gpt-4o',
  })

  if (!chatResponse?.choices[0]?.message?.content) {
    console.error('!chatResponse?.choices[0]?.message?.content', {
      chatResponse,
    })
    return json({
      error: {
        messages: [
          {
            title: 'Server error',
            message: 'Failed to parse the image. Please try again.',
          },
        ],
      },
    })
  }

  const jsonData = tryJsonParse(
    chatResponse.choices[0].message.content,
  ).unwrapOr(null)

  const parsed = ChatResponseSchema.safeParse(jsonData)

  if (parsed.error) {
    console.error('chatResponse schema is invalid', {
      jsonData,
      message: parsed.error.message,
    })

    return json({
      error: {
        messages: [
          {
            title: 'Server error',
            message: 'Failed to parse the image. Please try again.',
          },
        ],
      },
    })
  }

  const { friendlyName, scientificName, healthScore, otherDetails } =
    parsed.data

  const analysis = await prisma.coralAnalysis.create({
    data: {
      ownerId: userId,
      friendlyName,
      scientificName,
      healthScore,
      otherDetails,
      imageUrl
    },
    select: {
      id: true,
    },
  })

  return redirect('/dashboard/coral-analyses/' + analysis.id)
}

export async function loader({ request }: LoaderFunctionArgs) {
  await requireUserId(request, { redirectTo: '/' })
  return null
}

export default function DashboardCoralAnalysesNewPage() {
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
    <div className="w-full">
      <div className="mt-10">
        <label className="text-foreground">
          Upload Image of Coral
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
          <div className="fixed inset-x-5 bottom-5 md:static">
            <Button type="submit" className="w-full md:w-20">
              Analyze
            </Button>
          </div>
        </Form>
      </div>
    </div>
  )
}
