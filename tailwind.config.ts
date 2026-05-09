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
        neon: {
          cyan: '#00ffc8',
          purple: '#7b2fff',
          pink: '#ff2fff',
          blue: '#0066ff',
          green: '#00ff88',
        },
        dark: {
          bg: '#050508',
          panel: '#0a0a12',
          border: 'rgba(0, 255, 200, 0.12)',
          hover: 'rgba(0, 255, 200, 0.06)',
        },
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'Consolas', 'monospace'],
      },
      animation: {
        'scanline': 'scanline 3s linear infinite',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
        'blink': 'blink 1.2s step-end infinite',
        'data-flow': 'data-flow 0.1s step-end infinite',
        'border-flow': 'border-flow 3s linear infinite',
        'grid-breathe': 'grid-breathe 4s ease-in-out infinite',
        'type': 'typing 0.05s steps(1) forwards',
        'glow-pulse': 'glow-pulse 2s ease-in-out infinite',
        'slide-up': 'slide-up 0.4s ease-out forwards',
        'fade-in': 'fade-in 0.3s ease-out forwards',
      },
      keyframes: {
        scanline: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100vh)' },
        },
        'pulse-glow': {
          '0%, 100%': { opacity: '0.4' },
          '50%': { opacity: '1' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-12px)' },
        },
        blink: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0' },
        },
        'border-flow': {
          '0%': { backgroundPosition: '0% 50%' },
          '100%': { backgroundPosition: '200% 50%' },
        },
        'grid-breathe': {
          '0%, 100%': { opacity: '0.3' },
          '50%': { opacity: '0.6' },
        },
        'glow-pulse': {
          '0%, 100%': { boxShadow: '0 0 5px rgba(0, 255, 200, 0.3), 0 0 20px rgba(0, 255, 200, 0.1)' },
          '50%': { boxShadow: '0 0 20px rgba(0, 255, 200, 0.6), 0 0 40px rgba(0, 255, 200, 0.2)' },
        },
        'slide-up': {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
      backgroundImage: {
        'grid-pattern': 'linear-gradient(rgba(0, 255, 200, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 255, 200, 0.05) 1px, transparent 1px)',
      },
      backgroundSize: {
        'grid': '40px 40px',
      },
    },
  },
  plugins: [],
}
export default config
