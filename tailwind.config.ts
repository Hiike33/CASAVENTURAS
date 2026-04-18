import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Figtree', 'system-ui', 'sans-serif'],
      },
      colors: {
        cv: {
          white:   '#FFFFFF',
          off:     '#FAFAFA',
          gray1:   '#F5F5F5',
          border:  '#E5E5E5',
          borderD: '#E6E6E6',
          text:    '#4F4F4E',
          muted:   '#717170',
          ink:     '#111111',
          accent:  '#248D6C',
          accentH: '#1C6E54',
          accentL: '#E6F3EE',
          gold:    '#F5A623',
          thumbJ:  '#111E14',
          thumbO:  '#0A141E',
          thumbS:  '#1E0E08',
        },
      },
      letterSpacing: {
        label:   '0.14em',
        display: '0.22em',
        logo:    '0.20em',
      },
      borderRadius: {
        DEFAULT: '0px',
      },
    },
  },
  plugins: [],
}

export default config
