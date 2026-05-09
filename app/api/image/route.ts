import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const apiKey = process.env.FAL_API_KEY
  if (!apiKey) return NextResponse.json({ error: 'FAL_API_KEY not set' }, { status: 400 })

  const { imagePrompt } = await req.json()

  const stylePrefix = 'flat vector illustration, bold black outlines, vibrant colours, infographic cartoon style, The Infographics Show aesthetic, clean design, portrait 9:16, no text, '

  const res = await fetch('https://fal.run/fal-ai/flux/schnell', {
    method: 'POST',
    headers: {
      'Authorization': `Key ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      prompt: stylePrefix + imagePrompt,
      image_size: { width: 576, height: 1024 },
      num_inference_steps: 4,
      num_images: 1,
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    return NextResponse.json({ error: err }, { status: res.status })
  }

  const data = await res.json()
  const imageUrl = data.images?.[0]?.url
  if (!imageUrl) return NextResponse.json({ error: 'No image returned' }, { status: 500 })

  return NextResponse.json({ imageUrl })
}
