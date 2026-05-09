import { NextRequest, NextResponse } from 'next/server'

function notConfigured() {
  return new NextResponse(
    `<html><body style="background:#050508;color:#00ffc8;font-family:monospace;padding:40px;max-width:600px;margin:auto">
      <h2 style="color:#ff4466">⚠ TikTok not configured</h2>
      <p style="margin-top:16px;color:#aaa">You need to set up TikTok credentials in <code>.env.local</code>:</p>
      <ol style="margin-top:16px;color:#aaa;line-height:2">
        <li>Go to <a href="https://developers.tiktok.com" style="color:#00ffc8">developers.tiktok.com</a></li>
        <li>Create an app → request <strong>video.upload</strong> and <strong>video.publish</strong> scopes</li>
        <li>Add redirect URI: <code>http://localhost:3000/api/tiktok/callback</code></li>
        <li>Copy Client Key + Secret into <code>.env.local</code></li>
        <li>Restart the app</li>
      </ol>
      <p style="margin-top:16px;color:#888;font-size:12px">Note: TikTok requires app review for publish scope — can take a few days.</p>
    </body></html>`,
    { headers: { 'Content-Type': 'text/html' } }
  )
}

export async function GET() {
  if (!process.env.TIKTOK_CLIENT_KEY || process.env.TIKTOK_CLIENT_KEY === 'your_tiktok_client_key') {
    return notConfigured()
  }

  const scope = 'user.info.basic,video.upload,video.publish'
  const state = Math.random().toString(36).slice(2)
  const url = `https://www.tiktok.com/v2/auth/authorize/?client_key=${process.env.TIKTOK_CLIENT_KEY}&scope=${scope}&response_type=code&redirect_uri=${encodeURIComponent(process.env.TIKTOK_REDIRECT_URI ?? '')}&state=${state}`
  return NextResponse.redirect(url)
}

export async function POST(req: NextRequest) {
  if (!process.env.TIKTOK_CLIENT_KEY || process.env.TIKTOK_CLIENT_KEY === 'your_tiktok_client_key') {
    return NextResponse.json({ error: 'TikTok not configured — add credentials to .env.local' }, { status: 503 })
  }

  const accessToken = process.env.TIKTOK_ACCESS_TOKEN
  if (!accessToken) {
    return NextResponse.json({ error: 'TikTok not authenticated. Visit /api/tiktok to connect.' }, { status: 401 })
  }

  try {
    const form = await req.formData()
    const file = form.get('file') as File
    const title = form.get('title') as string

    const initRes = await fetch('https://open.tiktokapis.com/v2/post/publish/video/init/', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json; charset=UTF-8',
      },
      body: JSON.stringify({
        post_info: {
          title: title.slice(0, 150),
          privacy_level: 'PUBLIC_TO_EVERYONE',
          disable_duet: false,
          disable_comment: false,
          disable_stitch: false,
        },
        source_info: {
          source: 'FILE_UPLOAD',
          video_size: file.size,
          chunk_size: file.size,
          total_chunk_count: 1,
        },
      }),
    })

    const initData = await initRes.json()
    if (!initRes.ok) throw new Error(initData.error?.message || 'TikTok init failed')

    const { upload_url, publish_id } = initData.data
    const buffer = await file.arrayBuffer()

    const uploadRes = await fetch(upload_url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'video/mp4',
        'Content-Range': `bytes 0-${file.size - 1}/${file.size}`,
        'Content-Length': file.size.toString(),
      },
      body: buffer,
    })

    if (!uploadRes.ok) throw new Error('TikTok video upload failed')
    return NextResponse.json({ success: true, publishId: publish_id, url: 'https://www.tiktok.com — check your profile' })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
