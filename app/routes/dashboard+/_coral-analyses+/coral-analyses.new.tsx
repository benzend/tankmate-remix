import { Button } from '#app/components/ui/button.js'
import { requireUserId } from '#app/utils/auth.server.js'
import { ActionFunctionArgs, LoaderFunctionArgs, MetaFunction } from '@remix-run/node'
import { Form, json, redirect } from '@remix-run/react'
import { useState } from 'react'
import { Tooltip } from 'react-tooltip'
import { z } from 'zod'
import { parseWithZod } from '@conform-to/zod'
import { prisma } from '#app/utils/db.server.js'
import { ChatCompletionContentPart } from 'openai/resources/index.mjs'
import OpenAI from 'openai'
import { tryJsonParse } from '#app/utils/misc.js'
import { UploadDropzone } from '#app/utils/uploadthing'
import { UploadedFileData } from 'uploadthing/types'

export const meta: MetaFunction = () => [{ title: 'TankMate | Coral Analysis' }]

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
      text: `You are a coral identification expert. Analyze this coral image carefully, paying attention to:
- Morphology (branching, plating, massive, encrusting, etc.)
- Color patterns and variations
- Polyp structure and arrangement
- Texture and surface features
- Signs of bleaching, disease, or damage

Provide a detailed analysis in the following JSON format:
- friendlyName: Common name used by reef enthusiasts
- scientificName: Full genus and species if identifiable, or just genus if species is unclear
- healthScore: Scale of 1-10 where:
  10 = Perfect health (vibrant colors, no damage)
  7-9 = Good health (minor issues)
  4-6 = Moderate concerns (some bleaching/damage)
  1-3 = Poor health (severe bleaching/disease)
- otherDetails: Focus on distinctive identifying features and health indicators

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
      imageUrl,
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
  const [imgData, setImgData] = useState<null | UploadedFileData>(null)
  const [replacingImg, setReplacingImg] = useState(false)

  return (
    <div className="w-full">
      <div className="mt-10">
        <label className="text-foreground">
          Upload Image of Coral
          <Tooltip id="image-url-tooltip" className="absolute"></Tooltip>
        </label>
        <br />

        {imgData && (
          <img
            src={imgData.appUrl}
            width="300px"
            height="auto"
            className="mb-4"
            alt="uploaded fish tank"
          />
        )}

        {imgData && !replacingImg && (
          <Button variant="outline" onClick={() => setReplacingImg(true)}>Replace Image</Button>
        )}

        {(!imgData || replacingImg) && (
          <div className="relative">
            <UploadDropzone
              className="ut-button:bg-primary ut-button:text-primary-foreground"
              endpoint="imageUploader"
              onClientUploadComplete={(res) => {
                setImgData(res[0] || null)
                setReplacingImg(false)
              }}
              onUploadError={(error: Error) => {
                // Do something with the error.
                alert(`ERROR! ${error.message}`)
              }}
            />
            {replacingImg && <button className="absolute top-2 right-4 text-primary" onClick={() => setReplacingImg(false)}>x</button>}
            </div>
          )}

        <Form method="POST">
          {imgData && (
            <input
              type="text"
              value={imgData.appUrl}
              readOnly
              hidden
              name="imageUrl"
            />
          )}
          <br />
          <div className="fixed inset-x-5 bottom-5 md:static">
            <Button type="submit" className="w-full md:w-20" disabled={!imgData}>
              Analyze
            </Button>
          </div>
        </Form>
      </div>
    </div>
  )
}
