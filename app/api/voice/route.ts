import { NextRequest, NextResponse } from 'next/server'
import { writeFile } from 'fs/promises'
import { join } from 'path'
import { existsSync, mkdirSync } from 'fs'

// Deep dramatic narrator voice - great for Infographics Show style
const VOICE_ID = 'ErXwobaYiN019PkySvjV' // Antoni - deep male narrator

export async function POST(req: NextRequest) {
  const apiKey = process.env.ELEVENLABS_API_KEY
  if (!apiKey) return NextResponse.json({ error: 'ELEVENLABS_API_KEY not set' }, { status: 400 })

  const { text, sceneId } = await req.json()

  const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`, {
    method: 'POST',
    headers: {
      'xi-api-key': apiKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      text,
      model_id: 'eleven_monolingual_v1',
      voice_settings: {
        stability: 0.4,
        similarity_boost: 0.8,
        style: 0.3,
        use_speaker_boost: true,
      },
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    return NextResponse.json({ error: err }, { status: res.status })
  }

  const audioBuffer = await res.arrayBuffer()
  const audioDir = join(process.cwd(), 'public', 'generated', 'audio')
  if (!existsSync(audioDir)) mkdirSync(audioDir, { recursive: true })

  const filename = `scene-${sceneId}-${Date.now()}.mp3`
  const filepath = join(audioDir, filename)
  await writeFile(filepath, Buffer.from(audioBuffer))

  return NextResponse.json({ audioUrl: `/generated/audio/${filename}` })
}
