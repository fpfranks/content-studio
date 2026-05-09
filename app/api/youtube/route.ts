import { NextRequest, NextResponse } from 'next/server'
import { google } from 'googleapis'
import { Readable } from 'stream'

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
)

function bufferToStream(buffer: Buffer): Readable {
  const readable = new Readable()
  readable.push(buffer)
  readable.push(null)
  return readable
}

export async function GET() {
  const url = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: ['https://www.googleapis.com/auth/youtube.upload', 'https://www.googleapis.com/auth/youtube'],
    prompt: 'consent',
  })
  return NextResponse.redirect(url)
}

export async function POST(req: NextRequest) {
  const tokens = JSON.parse(process.env.GOOGLE_TOKENS ?? '{}')
  if (!tokens.access_token) {
    return NextResponse.json(
      { error: 'YouTube not authenticated. Visit /api/youtube to connect.' },
      { status: 401 }
    )
  }

  oauth2Client.setCredentials(tokens)
  const youtube = google.youtube({ version: 'v3', auth: oauth2Client })

  try {
    const form = await req.formData()
    const file = form.get('file') as File
    const title = form.get('title') as string
    const description = form.get('description') as string
    const tags = (form.get('tags') as string).split(/[\s,]+/).filter(Boolean)
    const privacy = (form.get('privacy') as string) || 'public'
    const platform = form.get('platform') as string

    const buffer = Buffer.from(await file.arrayBuffer())

    const isShorts = platform === 'shorts'

    const response = await youtube.videos.insert({
      part: ['snippet', 'status'],
      requestBody: {
        snippet: {
          title: isShorts ? title.slice(0, 100) : title,
          description,
          tags,
          categoryId: '22',
        },
        status: {
          privacyStatus: privacy,
          selfDeclaredMadeForKids: false,
        },
      },
      media: {
        body: bufferToStream(buffer),
        mimeType: file.type || 'video/mp4',
      },
    })

    const videoId = response.data.id
    const url = isShorts
      ? `https://youtube.com/shorts/${videoId}`
      : `https://youtube.com/watch?v=${videoId}`

    return NextResponse.json({ success: true, videoId, url })
  } catch (e: any) {
    console.error('YouTube upload error:', e)
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
