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
        gold: { DEFAULT: '#c9a227', bright: '#f0c040', dim: '#7a5c10' },
        amber: { DEFAULT: '#e07b10', bright: '#ff8c20' },
        parchment: { DEFAULT: '#ede0b8', mid: '#c4a86a', dim: '#7a6040', dark: '#4a3820' },
        shire: '#4a7c59',
        ink: '#0a0805',
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
