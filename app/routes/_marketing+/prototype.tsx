import {
	type ActionFunctionArgs,
	json,
	redirect,
} from '@remix-run/node'
import OpenAI from 'openai'
import { type MetaFunction } from '@remix-run/node'
import { Tooltip } from 'react-tooltip'
import { type ChatCompletionContentPart } from 'openai/resources/index.mjs'
import { prisma } from '#app/utils/db.server.js'
import { Form } from '@remix-run/react'

function getOpenAI() {
	const key = process.env['OPENAI_API_KEY']
	if (!key) return null
	return new OpenAI({ apiKey: key })
}

export const meta: MetaFunction = () => [{ title: 'ReefChronicles | Prototype' }]

export async function action({ request }: ActionFunctionArgs) {
	const client = getOpenAI()
	if (!client) {
		return json({
			error: { messages: ['OpenAI API key is not configured. AI-powered prototype is unavailable.'] },
		})
	}

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
			text: `
Can you get a health score (float from 0 - 10) from the tank based on this image? I need fish health, water health, algae health, and all fish, plants, and algae in the tank based on the image. Also, list out all of the types of fish, how many there are, and same for plants and whatever else

Also, summarize the fish count data into a JSON format. For each fish species or type of fish, follow the provided structure. Ensure that the \`label\` is human-readable and specific to the fish type. If applicable, include an estimated range for the count and any relevant notes.

### Format Example:

\`\`\`json
{
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
\`\`\`
`,
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
Here’s a more strict version of your prompt for summarizing the data into a JSON format, with clear instructions on how to structure each section:

\`\`\`
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


Here is the data to summarize:

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
			context: chatCompletion.choices[0].message.content,
			imageUrl: imageUrl,
		},
		select: {
			id: true,
		},
	})

	return redirect('/tanks/results/' + score.id)
}

export default function PrototypePage() {
	return (
		<>
			<main className="grid h-[calc(100vh-150px)] place-items-center">
				<div>
					<h1 className="font-serif text-center text-4xl lg:text-6xl">Prototype</h1>
					<div className="grid place-items-center px-4 py-16">
						<Form method="POST">
							<label className="text-sm">
								Image Url{' '}
								<a
									data-tooltip-id="image-url-tooltip"
									data-tooltip-content="Upload a clear image of your tank"
								>
									<span className="ml-1 text-xs text-slate-400">Tip</span>
								</a>
							</label>
							<br />
							<input
								type="text"
								name="image_url"
								id="image_url"
                placeholder="Insert a url of your tank"
								className="mr-2 rounded border border-foreground bg-transparent px-2 py-1 text-foreground"
							/>
							<button type="submit">Analyze</button>
						</Form>
					</div>
				</div>
			</main>
			<Tooltip id="image-url-tooltip"></Tooltip>
		</>
	)
}
