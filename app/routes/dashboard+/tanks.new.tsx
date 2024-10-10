import {
  type LoaderFunctionArgs,
  type ActionFunctionArgs,
} from '@remix-run/node'
import { Form, json, redirect, useFetcher } from '@remix-run/react'
import OpenAI from 'openai'
import { type ChatCompletionContentPart } from 'openai/resources/index.mjs'
import { useRef } from 'react'
import { Tooltip } from 'react-tooltip'
import { Input } from '#app/components/ui/input.js'
import { type action as cloudinaryAction } from '#app/routes/_image-upload+/cloudinary.tsx'
import { requireUserId } from '#app/utils/auth.server.js'
import { prisma } from '#app/utils/db.server.js'
import { tryJsonParse } from '#app/utils/misc.js'

const client = new OpenAI({
  apiKey: process.env['OPENAI_API_KEY'], // This is the default and can be omitted
})

export async function action({ request }: ActionFunctionArgs) {
  const userId = await requireUserId(request, { redirectTo: '/' })

  const body = await request.formData()

  const imageUrl = body.get('image_url')

  if (typeof imageUrl !== 'string') {
    return json({
      error: { messages: ['image_url is not a string'] },
    })
  }

  const watertypeContent: Array<ChatCompletionContentPart> = [
    {
      type: 'text',
      text: `Can you tell me what kind of water you think that this tank uses? The options are either saltwater or freshwater.

\`\`\`json
{
  "watertype": "saltwater"
}
\`\`\`
`,
    },
    { type: 'image_url', image_url: { url: imageUrl } },
  ]

  const watertypeChatCompletion = await client.chat.completions.create({
    response_format: { type: 'json_object' },
    messages: [{ role: 'user', content: watertypeContent }],
    model: 'gpt-4o',
  })

  if (!watertypeChatCompletion?.choices[0]?.message?.content) {
    console.error('!watertypeChatCompletion?.choices[0]?.message?.content')
    return redirect('/dashboard/tanks/new?error=chat')
  }

  const watertype = tryJsonParse(
    watertypeChatCompletion.choices[0].message.content,
  )?.unwrapOr(null)

  interface WatertypeResponse {
    watertype: string
  }

  const isValidWatertypeResponse = (res: unknown): res is WatertypeResponse => {
    return (
      !!res &&
      typeof res === 'object' &&
      typeof (res as Record<string, any>)['watertype'] === 'string'
    )
  }

  if (!isValidWatertypeResponse(watertype)) {
    console.error('!isValidWatertypeResponse', { watertype })
    return redirect('dashboard/tanks/new?error=chatresult')
  }

  const dimensionsContent: Array<ChatCompletionContentPart> = [
    {
      type: 'text',
      text: `Can you tell me what dimensions you think that this tank is? Give me your best guess. Format is length<int>, width<int>, height<int> in INCHES.

\`\`\`json
{
  "length": 40,
  "width": 45,
  "height": 40
}
\`\`\`
`,
    },
    { type: 'image_url', image_url: { url: imageUrl } },
  ]

  const dimensionsChatCompletion = await client.chat.completions.create({
    response_format: { type: 'json_object' },
    messages: [{ role: 'user', content: dimensionsContent }],
    model: 'gpt-4o',
  })

  if (!dimensionsChatCompletion?.choices[0]?.message?.content) {
    console.error('!dimensionsChatCompletion?.choices[0]?.message?.content', {
      dimensionsChatCompletion,
    })
    return redirect('/dashboard/tanks/new?error=dimensions')
  }

  const dimensions = tryJsonParse(
    dimensionsChatCompletion.choices[0].message.content,
  )?.unwrapOr(null)

  interface DimensionsResponse {
    length: number
    width: number
    height: number
  }

  const isValidDimensionsResponse = (
    res: unknown,
  ): res is DimensionsResponse => {
    return (
      !!res &&
      typeof res === 'object' &&
      typeof (res as Record<string, any>)['length'] === 'number' &&
      typeof (res as Record<string, any>)['width'] === 'number' &&
      typeof (res as Record<string, any>)['height'] === 'number'
    )
  }

  if (!isValidDimensionsResponse(dimensions)) {
    console.error('!isValidDimensionsResponse', { dimensions })
    return redirect('/dashboard/tanks/new?error=dimensions')
  }

  const tank = await prisma.fishTank.create({
    data: {
      name: 'My first fishtank',
      waterType: watertype['watertype'],
      dimensionsLength: dimensions['length'],
      dimensionsWidth: dimensions['width'],
      dimensionsHeight: dimensions['height'],
      userId: userId,
    },
  })

  const tankScoreContent: Array<ChatCompletionContentPart> = [
    {
      type: 'text',
      text: `
Summarize the following data into a JSON format by splitting it into clearly defined sections. Each section should follow the given structure.

### Format Example:

\`\`\`json
{
"aquarium_health": {
  "fish_health": {
    "type": "score",
    "label": "Fish Health",
    "score": 8.1,
    "note": "..."
  },
}
}
\`\`\`

### Instructions:

- For each aspect of the data (e.g., health, count), create a corresponding section in JSON.
- Use a human-readable phrase for the \`label\` key (e.g., "Fish Health", "Water Quality").
- If the data provides a rating or score, use \`"type": "score"\`.
  - Include the \`score\` value and any associated comments under the \`note\` field.
- If the data provides a count or number, use \`"type": "count"\`.
  - Include the \`total\` number for that section.
- Ensure all values follow the proper structure as shown in the example.

Also, summarize the fish count data into a JSON format. For each fish species or type of fish, follow the provided structure. Ensure that the \`label\` is human-readable and specific to the fish type. If applicable, include an estimated range for the count and any relevant notes.

### Format Example:

\`\`\`json
{
"fish_count": {
    "tetra_fish": {
        "type": "count",
        "label": "Tetra Fish Count",
        "total": 35,
        "range": "Approximately 30-40 (Neon or Cardinal Tetras)"
    },
    "rasbora": {
        "type": "count",
        "label": "Rasbora Count",
        "total": 13,
        "range": "Approximately 10-15 (likely Harlequin Rasbora)"
    },
    "other_species": {
        "type": "count",
        "label": "Other Fish Species Count",
        "total": "A few",
        "note": "A few more different species which are not distinctly visible to be identified."
    }
  }
}
\`\`\`
`,
    },
    { type: 'image_url', image_url: { url: imageUrl } },
  ]

  const chatCompletion = await client.chat.completions.create({
    response_format: { type: 'json_object' },
    messages: [{ role: 'user', content: tankScoreContent }],
    model: 'gpt-4o',
  })

  if (!chatCompletion?.choices[0]?.message?.content) {
    console.error('!chatCompletion?.choices[0]?.message?.content', {
      chatCompletion,
    })
    return redirect('/')
  }

  const score = await prisma.fishTankScore.create({
    data: {
      result: chatCompletion.choices[0].message.content,
      imageUrl: imageUrl,
      fishTankId: tank.id,
    },
    select: {
      id: true,
    },
  })

  return redirect('/dashboard/tanks/' + score.id)
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
      <main className="font-poppins grid h-full place-items-center">
        <div className="grid place-items-center px-4 py-16 xl:grid-cols-2 xl:gap-24">
          <label className="text-sm">
            Image{' '}
            <a
              data-tooltip-id="image-url-tooltip"
              data-tooltip-content="Upload a clear image of your tank to get the best results"
            >
              <span className="ml-1 text-xs text-slate-400">Tip</span>
            </a>
            <Tooltip id="image-url-tooltip" className="absolute"></Tooltip>
          </label>
          <br />
          {imgFetcher.data ? (
            <Form method="POST">
              <img
                src={imgData.imgSource}
                width="300px"
                height="auto"
                alt="uploaded fish tank"
              />
              <input
                type="text"
                value={imgData.imgSource}
                hidden
                name="image_url"
              />

              <button type="submit">Analyze</button>
            </Form>
          ) : (
            <imgFetcher.Form
              action="/cloudinary"
              method="POST"
              encType="multipart/form-data"
              id="image-upload-form"
              ref={imgUploadFormRef}
            >
              <Input
                name="img"
                type="file"
                placeholder="Image"
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
          )}
        </div>
      </main>
    </>
  )
}
