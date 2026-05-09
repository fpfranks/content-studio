import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'The Content Forge',
  description: 'A fellowship of tools for the content creator\'s journey',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;500;600;700&family=Cinzel+Decorative:wght@400;700&family=Lora:ital,wght@0,400;0,500;1,400&family=JetBrains+Mono:wght@300;400;500&display=swap" rel="stylesheet" />
      </head>
      <body className="min-h-screen overflow-x-hidden">
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="orb orb-3" />
        <div className="stone-texture" />
        <div className="vignette" />
        <div className="relative z-10">
          {children}
        </div>
      </body>
    </html>
  )
}
