import OpenAI from 'openai'

function getOpenAI() {
	const key = process.env['OPENAI_API_KEY']
	if (!key) return null
	return new OpenAI({ apiKey: key })
}

export async function chat({ request }: { request: Request }) {
	const client = getOpenAI()
	if (!client) {
		throw new Error('OpenAI API key is not configured.')
	}
	const chatCompletion = await client.chat.completions.create({
		messages: [{ role: 'user', content: 'Say this is a test' }],
		model: 'gpt-3.5-turbo',
	})

	console.log({ chatCompletion })

	return chatCompletion
}
