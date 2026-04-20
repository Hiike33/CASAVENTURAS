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
        // Secondary serif — pull-quotes, review italics, editorial accents only.
        // Never for display headings or body (see CLAUDE.md Design Principles).
        serif: ['"Cormorant Garamond"', 'Georgia', 'serif'],
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
        sm: '2px', // editorial micro-radius for cards / glass panels (D-019)
      },
      boxShadow: {
        // Hairline shadow for editorial elevation — barely perceptible,
        // adds depth without breaking the flat aesthetic. D-019.
        hairline: '0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.02)',
        frost: '0 8px 32px rgba(0,0,0,0.06)', // for frosted glass panels
      },
    },
  },
  plugins: [],
}

export default config
