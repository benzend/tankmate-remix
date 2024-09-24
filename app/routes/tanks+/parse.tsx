import { Form } from '@remix-run/react'
import { Tooltip } from 'react-tooltip';
export const meta: MetaFunction = () => [{ title: 'Epic Notes' }]
import {
  type ActionFunctionArgs,
  type MetaFunction,
  json,
  redirect,
} from '@remix-run/node'
import OpenAI from 'openai'
import { type ChatCompletionContentPart } from 'openai/resources/index.mjs'
import { prisma } from '#app/utils/db.server.js'

const client = new OpenAI({
  apiKey: process.env['OPENAI_API_KEY'], // This is the default and can be omitted
})

export async function action({ request }: ActionFunctionArgs) {
  const body = await request.formData()

  const imageUrl = body.get('image_url')

  if (typeof imageUrl !== 'string') {
    return json({
      error: { messages: ['image_url is not a string'] },
    })
  }

  const content: Array<ChatCompletionContentPart> = [
    {
      type: 'text',
      text: 'Can you get a health score from the tank based on this image? I need fish health, water health, algae health, and all fish, plants, and algae in the tank based on the image. Also, list out all of the types of fish, how many there are, and same for plants and whatever else',
    },
    { type: 'image_url', image_url: { url: imageUrl } },
  ]

  const chatCompletion = await client.chat.completions.create({
    messages: [{ role: 'user', content }],
    model: 'gpt-4o',
  })

  if (!chatCompletion?.choices[0]?.message?.content) {
    return redirect('/')
  }

  const jsonFormattedRes = await client.chat.completions.create({
    response_format: { type: 'json_object' },
    messages: [
      {
        role: 'user',
        content: `
Summarize this into a json format that splits up it into sections like this:

\`\`\`json
{
  "fish_health": { "score": 8.1, "note": "..." },
  "water_health": { "score": 9.0, "note": "..." },
  "plant_health": { "score": 6.2, "note": "..." },
  "coral_health": { "score": 8.9, "note": "..." },
  "sand_health": { "score": 6.0, "note": "..." },
  "fish_details": { "total": 30, "fish": [ { species: "blue tang", quantity: 2 }, { species: "clown fish", quantity: 3 }, ], note: "..." },
  "plant_details": { "total": 2, "plants": [ { species: "spaghetti algea", quantity: 2 } ], note: "..." },
  "coral_details": { "total": 3, "coral": [ { species: "star polyps", quantity: 2 }, { species: "candy cane corals", quantity: 1 } ], note: "..." },
  "sand_details": { "type": "black sand", "note": "..." }
}
\`\`\`

Here is the summary:

${chatCompletion.choices[0].message.content}
`,
      },
    ],
    model: 'gpt-4o',
  })

  if (!jsonFormattedRes?.choices[0]?.message?.content) {
    return redirect('/')
  }

  const score = await prisma.tankScore.create({
    data: {
      result: jsonFormattedRes.choices[0].message.content,
      imageUrl: imageUrl
    },
    select: {
      id: true,
    },
  })

  return redirect('/tanks/results/' + score.id)
}

export default function TanksParsePage() {
  return (
    <>
      <main className="font-poppins grid h-full place-items-center">
        <div className="grid place-items-center px-4 py-16 xl:grid-cols-2 xl:gap-24">
          <Form action="/tanks/parse" method="POST">
            <label className="text-sm">Image Url <a data-tooltip-id="image-url-tooltip" data-tooltip-content="Upload a clear image of your tank">
              <span className="text-slate-400 ml-1 text-xs">Tip</span>
              </a>
            </label>
            <br/>
            <input type="text" name="image_url" id="image_url" className="bg-transparent text-white border rounded border-white mr-2 px-2 py-1" />
            <button type="submit">Analyze</button>
          </Form>
        </div>
      </main>
       <Tooltip id="image-url-tooltip"></Tooltip>
    </>
  )
}
