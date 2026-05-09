import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(req: NextRequest) {
  const { text, type } = await req.json()  // type: 'hook' | 'title'

  const prompt = `You are a viral content expert specialising in YouTube Shorts and TikTok for a UK audience.

Analyse this ${type === 'hook' ? 'video hook (opening line)' : 'video title'} and score it:

"${text}"

Return ONLY valid JSON:
{
  "score": <number 0-100>,
  "verdict": "<one punchy word e.g. FIRE / WEAK / SOLID / VIRAL / MEH>",
  "strengths": ["<up to 3 short bullet points on what works>"],
  "improvements": ["<up to 3 short specific suggestions to make it stronger>"],
  "rewrite": "<one improved version of the ${type} that would perform better>",
  "retentionPrediction": "<e.g. 'High — creates curiosity gap' or 'Low — too generic'>",
  "platformFit": {
    "shorts": <score 0-100>,
    "tiktok": <score 0-100>,
    "youtube": <score 0-100>
  }
}`

  try {
    const msg = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 600,
      messages: [{ role: 'user', content: prompt }],
    })
    const raw = (msg.content[0] as { type: string; text: string }).text.trim()
    const jsonStart = raw.indexOf('{')
    const data = JSON.parse(raw.slice(jsonStart, raw.lastIndexOf('}') + 1))
    return NextResponse.json(data)
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
