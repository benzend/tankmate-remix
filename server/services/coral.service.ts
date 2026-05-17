import OpenAI from 'openai'
import { z } from 'zod'
import { prisma } from '../../app/utils/db.server.ts'

function getOpenAI() {
	const key = process.env['OPENAI_API_KEY']
	if (!key) return null
	return new OpenAI({ apiKey: key })
}

const ChatResponseSchema = z.object({
	friendlyName: z.string(),
	scientificName: z.string(),
	healthScore: z.number(),
	otherDetails: z.string(),
})

export async function getCoralAnalyses(userId: string) {
	return prisma.coralAnalysis.findMany({
		select: {
			id: true,
			friendlyName: true,
			scientificName: true,
			healthScore: true,
			otherDetails: true,
			imageUrl: true,
			createdAt: true,
		},
		where: { ownerId: userId },
		orderBy: { createdAt: 'desc' },
	})
}

export async function getCoralAnalysis(analysisId: string, userId: string) {
	return prisma.coralAnalysis.findFirst({
		select: {
			id: true,
			friendlyName: true,
			scientificName: true,
			healthScore: true,
			otherDetails: true,
			imageUrl: true,
			createdAt: true,
		},
		where: { id: analysisId, ownerId: userId },
	})
}

export async function analyzeCoralImage(userId: string, imageUrl: string, fishTankId?: string) {
	const client = getOpenAI()
	if (!client) {
		throw new Error('OpenAI API key is not configured. AI-powered coral analysis is unavailable.')
	}

	const content: Array<OpenAI.ChatCompletionContentPart> = [
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

	const responseContent = chatResponse?.choices[0]?.message?.content
	if (!responseContent) {
		throw new Error('No response from AI model')
	}

	let jsonData: unknown
	try {
		jsonData = JSON.parse(responseContent)
	} catch {
		throw new Error('Failed to parse AI response as JSON')
	}

	const parsed = ChatResponseSchema.safeParse(jsonData)
	if (!parsed.success) {
		throw new Error('AI response did not match expected schema')
	}

	const { friendlyName, scientificName, healthScore, otherDetails } = parsed.data

	const analysis = await prisma.coralAnalysis.create({
		data: {
			ownerId: userId,
			friendlyName,
			scientificName,
			healthScore,
			otherDetails,
			imageUrl,
			fishTankId: fishTankId || null,
		},
		select: { id: true, friendlyName: true, scientificName: true, healthScore: true, otherDetails: true, imageUrl: true },
	})

	return analysis
}
