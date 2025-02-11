import { json, type LoaderFunctionArgs } from '@remix-run/node'
import OpenAI from 'openai'
import { requireUserId } from '#app/utils/auth.server.js'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function loader({ request }: LoaderFunctionArgs) {
  await requireUserId(request)

  const url = new URL(request.url)
  const query = url.searchParams.get('query')

  if (!query) {
    return json({ results: [] })
  }

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are a knowledgeable reef tank expert assistant. Your role is to:
1. Provide accurate, concise answers about reef tank management, parameters, and maintenance
2. Format your response in two parts:
   - First, give a direct answer to the query
   - Then, list 2-3 relevant reference articles with titles and brief descriptions, and urls if relevant. Format should be \`title::description::url\`.
3. Focus on scientific accuracy and practical advice
4. When discussing parameters, always include safe ranges and testing frequency
5. For any potentially harmful advice, include safety warnings

Remember to structure your response so it can be parsed into a list of clickable results.
Use '---' to separate your direct answer from the reference articles.`,
        },
        {
          role: 'user',
          content: query,
        },
      ],
      max_tokens: 150,
    })

    // Process the response and format it for the frontend
    const response = completion.choices[0]?.message.content || ''
    const [answer, references] = response
      .split('---')
      .map((part) => part.trim())

    const results = [
      {
        title: 'Expert Answer',
        url: '#answer',
        content: answer,
      },
    ]

    // Parse reference articles if they exist
    if (references) {
      const referenceLines = references
        .split('\n')
        .filter((line) => line.trim())
      for (const line of referenceLines) {
        if (line.includes(':')) {
          const [title, description, url] = line
            .split('::')
            .map((part) => part.trim())
          results.push({
            title: title || '',
            url: url || '',
            content: description,
          })
        }
      }
    }

    return json({ results })
  } catch (error) {
    console.error('OpenAI API Error:', error)
    return json({
      results: [
        {
          title: "Sorry, I couldn't process that request.",
          url: '#',
        },
      ],
    })
  }
}
