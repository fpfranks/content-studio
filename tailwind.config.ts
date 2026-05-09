import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        gold: { DEFAULT: '#c9a227', bright: '#f0c040', dim: '#7a5c10', pale: '#e8d48a' },
        parchment: { DEFAULT: '#ede0b8', dim: '#9a8450', dark: '#5a4a28' },
        ember: { DEFAULT: '#e07b10', bright: '#ff5500' },
        forest: { DEFAULT: '#2a4a2a', bright: '#3d6e3d' },
        stone: { DEFAULT: '#3a3028', dark: '#1a1410' },
        shire: '#4a7c59',
        burgundy: '#6b1818',
        ink: '#0a0805',
        // keep these so existing class refs don't break
        neon: { cyan: '#c9a227', purple: '#7a5c10', pink: '#e07b10', blue: '#4a7c59', green: '#4a7c59' },
        dark: { bg: '#0a0805', panel: '#130f06', border: 'rgba(201,162,39,0.15)', hover: 'rgba(201,162,39,0.05)' },
      },
      fontFamily: {
        heading: ['Cinzel', 'Georgia', 'serif'],
        body: ['Lora', 'Georgia', 'serif'],
        mono: ['JetBrains Mono', 'Courier New', 'monospace'],
      },
    },
  },
  plugins: [],
}
export default config
