import { NextRequest, NextResponse } from 'next/server'
import { exec } from 'child_process'
import { writeFile, unlink, readFile } from 'fs/promises'
import { existsSync, mkdirSync } from 'fs'
import { join } from 'path'
import { promisify } from 'util'

const execAsync = promisify(exec)

interface Scene {
  id: string
  imageUrl: string
  audioUrl: string
  duration: number
}

async function downloadFile(url: string, dest: string) {
  if (url.startsWith('/')) {
    // Local file — copy from public directory
    const localPath = join(process.cwd(), 'public', url)
    const data = await readFile(localPath)
    await writeFile(dest, data)
  } else {
    // Remote URL
    const res = await fetch(url)
    const buf = await res.arrayBuffer()
    await writeFile(dest, Buffer.from(buf))
  }
}

export async function POST(req: NextRequest) {
  // Check ffmpeg is available
  try {
    await execAsync('ffmpeg -version')
  } catch {
    return NextResponse.json({ error: 'ffmpeg not found. Install ffmpeg and add it to PATH.' }, { status: 400 })
  }

  const { scenes, title }: { scenes: Scene[]; title: string } = await req.json()

  const tmpDir = join(process.cwd(), 'public', 'generated', 'tmp')
  const videosDir = join(process.cwd(), 'public', 'generated', 'videos')
  if (!existsSync(tmpDir)) mkdirSync(tmpDir, { recursive: true })
  if (!existsSync(videosDir)) mkdirSync(videosDir, { recursive: true })

  const sessionId = Date.now().toString()
  const clipPaths: string[] = []

  try {
    // Step 1: Download all assets and build scene clips
    for (const scene of scenes) {
      const imgPath = join(tmpDir, `img-${sessionId}-${scene.id}.jpg`)
      const audioPath = join(tmpDir, `audio-${sessionId}-${scene.id}.mp3`)
      const clipPath = join(tmpDir, `clip-${sessionId}-${scene.id}.mp4`)

      await downloadFile(scene.imageUrl, imgPath)
      await downloadFile(scene.audioUrl, audioPath)

      // Ken Burns zoom effect: slow zoom from 1.0 to 1.3x over the scene duration
      // Output: 1080x1920 portrait (YouTube Shorts / TikTok format)
      const fps = 25
      const frames = scene.duration * fps
      const cmd = [
        'ffmpeg -y',
        `-loop 1 -i "${imgPath}"`,
        `-i "${audioPath}"`,
        `-filter_complex "[0:v]scale=8000:-1,zoompan=z='min(zoom+0.0012,1.3)':d=${frames}:x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':s=1080x1920:fps=${fps}[v];[v]setsar=1[vout]"`,
        '-map "[vout]"',
        '-map 1:a',
        '-c:v libx264 -preset fast -crf 23',
        '-c:a aac -ar 44100',
        '-shortest',
        `-t ${scene.duration}`,
        `"${clipPath}"`,
      ].join(' ')

      await execAsync(cmd)
      clipPaths.push(clipPath)
    }

    // Step 2: Create concat list
    const listPath = join(tmpDir, `list-${sessionId}.txt`)
    const listContent = clipPaths.map(p => `file '${p.replace(/\\/g, '/')}'`).join('\n')
    await writeFile(listPath, listContent)

    // Step 3: Concatenate all clips
    const safeTitle = title.replace(/[^a-zA-Z0-9]/g, '-').slice(0, 40)
    const outputPath = join(videosDir, `${safeTitle}-${sessionId}.mp4`)

    await execAsync(`ffmpeg -y -f concat -safe 0 -i "${listPath}" -c copy "${outputPath}"`)

    // Step 4: Clean up temp files
    for (const p of clipPaths) { try { await unlink(p) } catch {} }
    try { await unlink(listPath) } catch {}

    const videoUrl = `/generated/videos/${safeTitle}-${sessionId}.mp4`
    return NextResponse.json({ videoUrl })

  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Assembly failed' }, { status: 500 })
  }
}
