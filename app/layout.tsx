import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'CONTENT STUDIO // SYS-01',
  description: 'AI-powered content creation and publishing platform',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="scanlines noise bg-dark-bg min-h-screen overflow-x-hidden">
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="orb orb-3" />
        <div className="scan-sweep" />
        <div className="grid-bg fixed inset-0 z-0 pointer-events-none" />
        <div className="relative z-10">
          {children}
        </div>
      </body>
    </html>
  )
}
