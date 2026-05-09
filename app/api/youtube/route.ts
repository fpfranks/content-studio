import { NextRequest, NextResponse } from 'next/server'
import { google } from 'googleapis'
import { Readable } from 'stream'

function notConfigured() {
  return new NextResponse(
    `<html><body style="background:#050508;color:#00ffc8;font-family:monospace;padding:40px;max-width:600px;margin:auto">
      <h2 style="color:#ff4466">⚠ YouTube not configured</h2>
      <p style="margin-top:16px;color:#aaa">You need to set up Google credentials in <code>.env.local</code>:</p>
      <ol style="margin-top:16px;color:#aaa;line-height:2">
        <li>Go to <a href="https://console.cloud.google.com" style="color:#00ffc8">console.cloud.google.com</a></li>
        <li>Create a project → Enable <strong>YouTube Data API v3</strong></li>
        <li>Credentials → Create OAuth 2.0 Client ID (Web application)</li>
        <li>Add redirect URI: <code>http://localhost:3000/api/youtube/callback</code></li>
        <li>Copy Client ID + Secret into <code>.env.local</code></li>
        <li>Restart the app</li>
      </ol>
    </body></html>`,
    { headers: { 'Content-Type': 'text/html' } }
  )
}

export async function GET() {
  if (!process.env.GOOGLE_CLIENT_ID || process.env.GOOGLE_CLIENT_ID === 'your_google_client_id') {
    return notConfigured()
  }

  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  )

  const url = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: ['https://www.googleapis.com/auth/youtube.upload', 'https://www.googleapis.com/auth/youtube'],
    prompt: 'consent',
  })
  return NextResponse.redirect(url)
}

function bufferToStream(buffer: Buffer): Readable {
  const readable = new Readable()
  readable.push(buffer)
  readable.push(null)
  return readable
}

export async function POST(req: NextRequest) {
  if (!process.env.GOOGLE_CLIENT_ID || process.env.GOOGLE_CLIENT_ID === 'your_google_client_id') {
    return NextResponse.json({ error: 'YouTube not configured — add Google credentials to .env.local' }, { status: 503 })
  }

  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  )

  const tokens = JSON.parse(process.env.GOOGLE_TOKENS ?? '{}')
  if (!tokens.access_token) {
    return NextResponse.json({ error: 'YouTube not authenticated. Visit /api/youtube to connect.' }, { status: 401 })
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
        snippet: { title: isShorts ? title.slice(0, 100) : title, description, tags, categoryId: '22' },
        status: { privacyStatus: privacy, selfDeclaredMadeForKids: false },
      },
      media: { body: bufferToStream(buffer), mimeType: file.type || 'video/mp4' },
    })

    const videoId = response.data.id
    const url = isShorts ? `https://youtube.com/shorts/${videoId}` : `https://youtube.com/watch?v=${videoId}`
    return NextResponse.json({ success: true, videoId, url })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
