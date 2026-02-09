import OpenAI from 'openai'

const openai = new OpenAI({
	apiKey: process.env.OPENAI_API_KEY,
})

const INLINE_SEPARATOR = ':::'

export type SearchResult = {
	title: string
	url: string | null
	content: string | null
}

export async function searchReefTank(query: string): Promise<SearchResult[]> {
	const completion = await openai.chat.completions.create({
		model: 'gpt-4o-mini',
		messages: [
			{
				role: 'system',
				content: `You are a knowledgeable reef tank expert assistant. Your role is to:
1. Provide accurate, concise answers about reef tank management, parameters, and maintenance
2. Format your response in two parts:
   - First, give a direct answer to the query
   - Then, list 2-3 relevant reference articles with titles and brief descriptions, and urls if relevant. Format should be \`title${INLINE_SEPARATOR}description${INLINE_SEPARATOR}url\`.
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

	const response = completion.choices[0]?.message.content || ''
	const [answer, references] = response.split('---').map((part) => part.trim())

	const results: SearchResult[] = [
		{
			title: 'Expert Answer',
			url: null,
			content: answer || null,
		},
	]

	if (references) {
		const referenceLines = references.split('\n').filter((line) => line.trim())
		for (const line of referenceLines) {
			if (line.includes(INLINE_SEPARATOR)) {
				const [title, description, url] = line
					.split(INLINE_SEPARATOR)
					.map((part) => part.trim())
				results.push({
					title: title || '',
					url: url || null,
					content: description || null,
				})
			}
		}
	}

	return results
}
