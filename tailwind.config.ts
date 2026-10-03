import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#0d6e40',
          dark: '#10b981',
          light: '#059669'
        },
        danger: '#b91c1c',
        warning: '#b45309',
        background: {
          DEFAULT: '#ffffff',
          dark: '#111827'
        },
        surface: {
          DEFAULT: '#f5f5f4',
          dark: '#1f2937'
        },
        border: {
          DEFAULT: '#e5e7eb',
          dark: '#374151'
        },
        'text-primary': {
          DEFAULT: '#111827',
          dark: '#f9fafb'
        },
        'text-secondary': {
          DEFAULT: '#6b7280',
          dark: '#9ca3af'
        },
        'green-light': {
          DEFAULT: '#e8f5ee',
          dark: '#064e3b'
        },
        'amber-light': {
          DEFAULT: '#fef3cd',
          dark: '#78350f'
        },
        'red-light': {
          DEFAULT: '#fde8e8',
          dark: '#7f1d1d'
        },
        'green-dark': '#0a4a2a',
        'amber-dark': '#92400e',
        'red-dark': '#7f1d1d',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      minHeight: {
        'screen-dvh': '100dvh',
      },
      animation: {
        'pulse-ring': 'pulse-ring 1s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'waveform': 'waveform 1.5s ease-in-out infinite',
        'typing-dot': 'typing-dot 1.4s ease-in-out infinite',
      },
      keyframes: {
        'pulse-ring': {
          '0%': {
            transform: 'scale(1)',
            opacity: '1',
          },
          '50%': {
            transform: 'scale(1.1)',
            opacity: '0.7',
          },
          '100%': {
            transform: 'scale(1)',
            opacity: '1',
          },
        },
        'waveform': {
          '0%, 100%': {
            height: '8px',
          },
          '50%': {
            height: '24px',
          },
        },
        'typing-dot': {
          '0%, 60%, 100%': {
            transform: 'translateY(0)',
          },
          '30%': {
            transform: 'translateY(-10px)',
          },
        },
      },
    },
  },
  plugins: [],
}
export default config
