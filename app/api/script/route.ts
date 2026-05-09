import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(req: NextRequest) {
  const { topic, category, tone } = await req.json()

  const categoryMap: Record<string, string> = {
    history: 'history',
    science: 'science',
    military: 'military history and warfare',
    nature: 'nature and animals',
    truecrime: 'true crime and mysteries',
  }

  const toneMap: Record<string, string> = {
    dramatic: 'dramatic and intense, like a movie trailer',
    shocking: 'shocking and mind-blowing, every sentence reveals something unexpected',
    dark: 'dark and unsettling, highlighting the disturbing truth',
    educational: 'educational but gripping, like the best documentary you have ever seen',
  }

  const prompt = `You are a scriptwriter for a viral YouTube Shorts channel styled exactly like The Infographics Show. You write punchy, dramatic, fact-packed scripts for 50-58 second animated infographic videos.

Topic: ${topic}
Category: ${categoryMap[category] || category}
Tone: ${toneMap[tone] || tone}

Write a script with EXACTLY 8 scenes. Each scene is narrated while a flat cartoon illustration is shown on screen.

RULES:
- Scene 1 (HOOK): Open with a shocking question or jaw-dropping fact. Must stop the scroll instantly. Examples: "What if I told you..." / "In [year], something happened that changed everything..."
- Scenes 2-6: Build the story dramatically. Drop facts one by one. Use transitions like "But here's what nobody tells you...", "What happened next shocked everyone...", "The truth is even stranger..."
- Scene 7: The climax - the most shocking or surprising revelation
- Scene 8: Wrap up + strong CTA: "Follow for more facts like this" or "Drop a comment if this surprised you"
- Each narration: 2-4 punchy sentences, 6-8 seconds when read aloud
- Keep sentences SHORT. No long academic language. Write how people SPEAK.
- Total script should be 55 seconds when read at a normal pace

For each scene imagePrompt, describe a vivid flat cartoon illustration:
- Style: flat vector art, bold black outlines, vibrant colours, infographic animation style, like The Infographics Show
- Be SPECIFIC about characters, objects, settings, actions
- No text in the image. Portrait orientation (9:16)

Return ONLY valid JSON:
{
  "title": "YouTube title under 65 chars with shocking angle",
  "description": "YouTube description 2-3 sentences with keywords",
  "hashtags": ["#History", "#Facts", "#DidYouKnow", "#Shorts"],
  "scenes": [
    {
      "id": "1",
      "narration": "Exactly what the narrator says",
      "imagePrompt": "Detailed flat cartoon illustration description",
      "duration": 7
    }
  ]
}`

  const message = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 2000,
    messages: [{ role: 'user', content: prompt }],
  })

  const raw = (message.content[0] as { type: string; text: string }).text
  const jsonMatch = raw.match(/\{[\s\S]*\}/)
  if (!jsonMatch) return NextResponse.json({ error: 'Invalid response' }, { status: 500 })

  return NextResponse.json(JSON.parse(jsonMatch[0]))
}
