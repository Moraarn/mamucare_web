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
        'primary': { DEFAULT: 'rgb(var(--rgb-primary) / <alpha-value>)', dark: 'rgb(var(--rgb-primary-dark) / <alpha-value>)', light: 'rgb(var(--rgb-primary-light) / <alpha-value>)' },
        'background': { DEFAULT: 'rgb(var(--rgb-background) / <alpha-value>)', dark: 'rgb(var(--rgb-background-dark) / <alpha-value>)' },
        'surface': { DEFAULT: 'rgb(var(--rgb-surface) / <alpha-value>)', dark: 'rgb(var(--rgb-surface-dark) / <alpha-value>)' },
        'border': { DEFAULT: 'rgb(var(--rgb-border) / <alpha-value>)', dark: 'rgb(var(--rgb-border-dark) / <alpha-value>)' },
        'text-primary': { DEFAULT: 'rgb(var(--rgb-text-primary) / <alpha-value>)', dark: 'rgb(var(--rgb-text-primary-dark) / <alpha-value>)' },
        'text-secondary': { DEFAULT: 'rgb(var(--rgb-text-secondary) / <alpha-value>)', dark: 'rgb(var(--rgb-text-secondary-dark) / <alpha-value>)' },
        'green-light': { DEFAULT: 'rgb(var(--rgb-green-light) / <alpha-value>)', dark: 'rgb(var(--rgb-green-light-dark) / <alpha-value>)' },
        'amber-light': { DEFAULT: 'rgb(var(--rgb-amber-light) / <alpha-value>)', dark: 'rgb(var(--rgb-amber-light-dark) / <alpha-value>)' },
        'red-light': { DEFAULT: 'rgb(var(--rgb-red-light) / <alpha-value>)', dark: 'rgb(var(--rgb-red-light-dark) / <alpha-value>)' },
        'primary-hover': 'rgb(var(--rgb-primary-hover) / <alpha-value>)',
        'secondary': 'rgb(var(--rgb-secondary) / <alpha-value>)',
        'surface-soft': 'rgb(var(--rgb-surface-soft) / <alpha-value>)',
        'success': 'rgb(var(--rgb-success) / <alpha-value>)',
        'danger': 'rgb(var(--rgb-danger) / <alpha-value>)',
        'warning': 'rgb(var(--rgb-warning) / <alpha-value>)',
        'green-dark': 'rgb(var(--rgb-green-dark) / <alpha-value>)',
        'amber-dark': 'rgb(var(--rgb-amber-dark) / <alpha-value>)',
        'red-dark': 'rgb(var(--rgb-red-dark) / <alpha-value>)',
        'gray': { '50': 'rgb(var(--rgb-background) / <alpha-value>)', '100': 'rgb(var(--rgb-surface) / <alpha-value>)', '200': 'rgb(var(--rgb-surface-soft) / <alpha-value>)', '300': 'rgb(var(--rgb-border) / <alpha-value>)', '600': 'rgb(var(--rgb-text-secondary) / <alpha-value>)', '700': 'rgb(var(--rgb-text-primary) / <alpha-value>)', '900': 'rgb(var(--rgb-background-dark) / <alpha-value>)' },
        'green': { '600': 'rgb(var(--rgb-success) / <alpha-value>)' },
        'red': { '100': 'rgb(var(--rgb-red-light) / <alpha-value>)', '500': 'rgb(var(--rgb-danger) / <alpha-value>)' },
      },
      fontFamily: { sans: ['var(--font-body)'], serif: ['var(--font-heading)'] },
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
