import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(req: NextRequest) {
  const { topic, duration, style, platform } = await req.json()

  const durationGuide = {
    short: 'YouTube Shorts or TikTok (30–60 seconds). Very tight, every word counts.',
    medium: '5–10 minute YouTube video. Good pacing, covers topic well.',
    long: '15–20 minute YouTube deep dive. Full exploration with examples and storytelling.',
  }[duration as string] ?? '5–10 minute YouTube video'

  const styleGuide = {
    vlog: 'casual vlog style — talk directly to camera, conversational, authentic, first person',
    educational: 'educational — clear structure, teach the viewer something valuable, examples',
    storytelling: 'narrative storytelling — build tension, have a arc, pay off at the end',
    motivational: 'motivational — real talk, inspire action, honest about the journey',
    'talking-head': 'direct talking head — confident, punchy, no fluff, straight to the point',
  }[style as string] ?? 'authentic vlog style'

  const prompt = `You are an expert YouTube/TikTok scriptwriter. Write a complete video script for a UK content creator.

Topic: "${topic}"
Format: ${durationGuide}
Style: ${styleGuide}
Platform: ${platform}

Return ONLY valid JSON (no markdown):

{
  "title": "suggested video title",
  "estimatedDuration": "e.g. 8 minutes",
  "hook": {
    "text": "The opening 5-10 seconds — must stop the scroll. Bold, intriguing, or shocking statement.",
    "direction": "Camera direction / action note for this section"
  },
  "intro": {
    "text": "30-45 second intro — expand the hook, tell viewer what they'll get, why it matters to them",
    "direction": "Camera direction / action note"
  },
  "sections": [
    {
      "title": "Section title (shown as chapter)",
      "text": "Full script text for this section — natural speech, write how you talk not how you type",
      "direction": "Camera direction, B-roll suggestions, any visual notes",
      "duration": "approx duration e.g. '2 minutes'"
    }
  ],
  "outro": {
    "text": "Wrap up, CTA to subscribe/follow, tease next video",
    "direction": "Camera direction"
  },
  "brollSuggestions": ["list of 6–8 specific B-roll shots that would work well"],
  "chapterMarkers": ["00:00 - Hook", "00:10 - Intro", ...etc with approximate timestamps],
  "toneNotes": "2-3 sentences on delivery — pace, energy level, where to pause for effect"
}`

  try {
    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 4000,
      messages: [{ role: 'user', content: prompt }],
    })

    const raw = (message.content[0] as { type: string; text: string }).text.trim()
    const jsonStart = raw.indexOf('{')
    const jsonEnd = raw.lastIndexOf('}')
    const data = JSON.parse(raw.slice(jsonStart, jsonEnd + 1))
    return NextResponse.json(data)
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
