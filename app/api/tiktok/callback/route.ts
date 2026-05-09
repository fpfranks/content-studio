import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get('code')
  if (!code) return NextResponse.json({ error: 'No code' }, { status: 400 })

  try {
    const res = await fetch('https://open.tiktokapis.com/v2/oauth/token/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_key: process.env.TIKTOK_CLIENT_KEY ?? '',
        client_secret: process.env.TIKTOK_CLIENT_SECRET ?? '',
        code,
        grant_type: 'authorization_code',
        redirect_uri: process.env.TIKTOK_REDIRECT_URI ?? '',
      }),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error_description || 'Token exchange failed')

    const envPath = path.join(process.cwd(), '.env.local')
    let env = fs.existsSync(envPath) ? fs.readFileSync(envPath, 'utf-8') : ''
    const tokenLine = `\nTIKTOK_ACCESS_TOKEN=${data.access_token}\n`
    if (env.includes('TIKTOK_ACCESS_TOKEN=')) {
      env = env.replace(/\nTIKTOK_ACCESS_TOKEN=.*\n/, tokenLine)
    } else {
      env += tokenLine
    }
    fs.writeFileSync(envPath, env)

    return new NextResponse('<html><body style="background:#050508;color:#00ffc8;font-family:monospace;display:flex;align-items:center;justify-content:center;height:100vh;"><h2>✓ TikTok Connected — you can close this tab</h2></body></html>', {
      headers: { 'Content-Type': 'text/html' },
    })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
