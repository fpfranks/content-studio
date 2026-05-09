import { NextRequest, NextResponse } from 'next/server'

const TIKTOK_CLIENT_KEY = process.env.TIKTOK_CLIENT_KEY
const TIKTOK_CLIENT_SECRET = process.env.TIKTOK_CLIENT_SECRET
const REDIRECT_URI = process.env.TIKTOK_REDIRECT_URI

export async function GET() {
  // TikTok OAuth initiation
  const scope = 'user.info.basic,video.upload,video.publish'
  const state = Math.random().toString(36).slice(2)
  const url = `https://www.tiktok.com/v2/auth/authorize/?client_key=${TIKTOK_CLIENT_KEY}&scope=${scope}&response_type=code&redirect_uri=${encodeURIComponent(REDIRECT_URI ?? '')}&state=${state}`
  return NextResponse.redirect(url)
}

export async function POST(req: NextRequest) {
  const accessToken = process.env.TIKTOK_ACCESS_TOKEN
  if (!accessToken) {
    return NextResponse.json(
      { error: 'TikTok not authenticated. Visit /api/tiktok to connect.' },
      { status: 401 }
    )
  }

  try {
    const form = await req.formData()
    const file = form.get('file') as File
    const title = form.get('title') as string

    // Step 1: Init upload
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

    // Step 2: Upload the video
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

    return NextResponse.json({
      success: true,
      publishId: publish_id,
      url: 'https://www.tiktok.com — check your profile for the upload',
    })
  } catch (e: any) {
    console.error('TikTok upload error:', e)
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
