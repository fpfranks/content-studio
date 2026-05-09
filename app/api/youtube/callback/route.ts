import { NextRequest, NextResponse } from 'next/server'
import { google } from 'googleapis'
import fs from 'fs'
import path from 'path'

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
)

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get('code')
  if (!code) return NextResponse.json({ error: 'No code' }, { status: 400 })

  try {
    const { tokens } = await oauth2Client.getToken(code)
    // In production use a proper token store — this writes to .env.local for dev ease
    const envPath = path.join(process.cwd(), '.env.local')
    let env = fs.existsSync(envPath) ? fs.readFileSync(envPath, 'utf-8') : ''
    const tokenLine = `\nGOOGLE_TOKENS=${JSON.stringify(tokens)}\n`
    if (env.includes('GOOGLE_TOKENS=')) {
      env = env.replace(/\nGOOGLE_TOKENS=.*\n/, tokenLine)
    } else {
      env += tokenLine
    }
    fs.writeFileSync(envPath, env)
    return new NextResponse('<html><body style="background:#050508;color:#00ffc8;font-family:monospace;display:flex;align-items:center;justify-content:center;height:100vh;"><h2>✓ YouTube Connected — you can close this tab</h2></body></html>', {
      headers: { 'Content-Type': 'text/html' },
    })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
