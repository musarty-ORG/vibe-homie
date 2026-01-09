import { Models } from '@/ai/constants'
import { NextResponse } from 'next/server'
import { generateText, Output } from 'ai'
import { linesSchema, resultSchema } from '@/components/error-monitor/schemas'
import prompt from './prompt.md'

export async function POST(req: Request) {
  const body = await req.json()
  const parsedBody = linesSchema.safeParse(body)
  if (!parsedBody.success) {
    return NextResponse.json({ error: `Invalid request` }, { status: 400 })
  }

  const result = await generateText({
    system: prompt,
    model: Models.OpenAIGPT52,
    providerOptions: {
      openai: {
        include: ['reasoning.encrypted_content'],
        reasoningEffort: 'low',
        reasoningSummary: 'auto',
        serviceTier: 'priority',
      },
    },
    messages: [{ role: 'user', content: JSON.stringify(parsedBody.data) }],
    output: Output.object({ schema: resultSchema }),
  })

  return NextResponse.json(result.output, {
    status: 200,
  })
}
