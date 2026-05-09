import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(req: NextRequest) {
  const { topic, vibe, platform, videoName } = await req.json()

  const platformContext = {
    both: 'YouTube long-form and TikTok',
    youtube: 'YouTube long-form video',
    tiktok: 'TikTok short-form video',
    shorts: 'YouTube Shorts (vertical, under 60 seconds)',
  }[platform as string] ?? 'YouTube and TikTok'

  const vibeContext = {
    authentic: 'authentic, raw, day-in-the-life style — like talking to a friend',
    viral: 'high energy, punchy, designed to go viral with bold claims and fast cuts',
    educational: 'educational, value-packed, teaching the viewer something useful',
    motivational: 'motivational and inspiring, real stories of growth and hustle',
    'behind-scenes': 'behind the scenes, unfiltered look at the creative/business process',
    storytelling: 'narrative storytelling, build tension and pay off',
  }[vibe as string] ?? 'authentic'

  const prompt = `You are an expert UK content creator and social media strategist. Generate comprehensive content for a ${platformContext} video.

Video topic: "${topic}"
Content vibe: ${vibeContext}
${videoName ? `File name hint: ${videoName}` : ''}

Generate the following in valid JSON (no markdown, just raw JSON):

{
  "titles": [5 compelling video titles — mix of curiosity, value, and hook. Make them specific and clickable. UK audience.],
  "descriptions": {
    "youtube": "Full YouTube description (200-300 words). Include hook paragraph, what viewers will learn/see, timestamps placeholder, CTA to subscribe, relevant links placeholder. UK voice.",
    "tiktok": "TikTok caption (100-150 chars max) with line breaks for readability and hooks. End with CTA."
  },
  "hashtags": {
    "youtube": [8-12 YouTube hashtags — mix of broad and niche, no # symbol needed, return as array],
    "tiktok": [12-18 TikTok hashtags — trending and niche mix, return as array with # symbol]
  },
  "hooks": [5 opening lines for the first 3 seconds of the video — must stop the scroll. Short, punchy, creates curiosity or makes a bold statement.],
  "captions": [8-10 on-screen text lines/captions that could appear throughout the video — punchy, bold, reinforce key moments],
  "thumbnailIdeas": [3 specific thumbnail concepts — describe the visual layout, text overlay, facial expression, background, colour scheme],
  "bestPostTimes": "2-3 sentence advice on best times to post this specific type of content for UK audience on each platform, based on algorithm patterns"
}

Return ONLY the JSON object. No explanation.`

  try {
    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 2000,
      messages: [{ role: 'user', content: prompt }],
    })

    const raw = (message.content[0] as { type: string; text: string }).text.trim()
    const jsonStart = raw.indexOf('{')
    const jsonEnd = raw.lastIndexOf('}')
    const jsonStr = raw.slice(jsonStart, jsonEnd + 1)
    const data = JSON.parse(jsonStr)

    return NextResponse.json(data)
  } catch (e: any) {
    console.error('Generate error:', e)
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
