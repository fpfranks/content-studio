import { NextRequest, NextResponse } from 'next/server'
import { writeFile } from 'fs/promises'
import { join } from 'path'
import { existsSync, mkdirSync } from 'fs'

const VOICE_ID = 'ErXwobaYiN019PkySvjV' // Antoni — deep dramatic narrator

export async function POST(req: NextRequest) {
  const apiKey = process.env.ELEVENLABS_API_KEY
  if (!apiKey) return NextResponse.json({ error: 'ELEVENLABS_API_KEY not set' }, { status: 400 })

  const { text, sceneId } = await req.json()

  const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`, {
    method: 'POST',
    headers: { 'xi-api-key': apiKey, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      text,
      model_id: 'eleven_monolingual_v1',
      voice_settings: { stability: 0.4, similarity_boost: 0.8, style: 0.3, use_speaker_boost: true },
    }),
  })

  if (!res.ok) return NextResponse.json({ error: await res.text() }, { status: res.status })

  const audioBuffer = await res.arrayBuffer()

  // Try to save to disk (works locally). On Vercel, fall back to base64 data URL.
  try {
    const audioDir = join(process.cwd(), 'public', 'generated', 'audio')
    if (!existsSync(audioDir)) mkdirSync(audioDir, { recursive: true })
    const filename = `scene-${sceneId}-${Date.now()}.mp3`
    await writeFile(join(audioDir, filename), Buffer.from(audioBuffer))
    return NextResponse.json({ audioUrl: `/generated/audio/${filename}` })
  } catch {
    const base64 = Buffer.from(audioBuffer).toString('base64')
    return NextResponse.json({ audioUrl: `data:audio/mp3;base64,${base64}` })
  }
}
