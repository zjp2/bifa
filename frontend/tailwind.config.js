/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        paper: 'var(--paper)',
        'paper-deep': 'var(--paper-deep)',
        'paper-shadow': 'var(--paper-shadow)',
        ink: 'var(--ink)',
        'ink-soft': 'var(--ink-soft)',
        'ink-faded': 'var(--ink-faded)',
        accent: 'var(--accent)',
        'accent-soft': 'var(--accent-soft)',
        gold: 'var(--gold)',
        leaf: 'var(--leaf)',
        'margin-line': 'var(--margin-line)',
        shelf: 'var(--shelf)',
        'shelf-deep': 'var(--shelf-deep)',
      },
      fontFamily: {
        serif: ['Spectral', 'Noto Serif SC', 'Georgia', 'serif'],
        cn: ['Noto Serif SC', 'serif'],
        brush: ['"Ma Shan Zheng"', 'serif'],
        latin: ['"Cormorant Garamond"', 'serif'],
        hand: ['Caveat', 'cursive'],
        mono: ['"JetBrains Mono"', '"Fira Code"', 'Consolas', 'monospace'],
      },
      borderRadius: {
        book: '2px',
      },
      boxShadow: {
        book: '4px 6px 16px rgba(0,0,0,0.3), 8px 10px 24px rgba(0,0,0,0.15)',
        panel: '0 6px 20px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.1)',
        card: '0 20px 50px rgba(60,40,20,0.15), inset 0 0 0 6px rgba(255,255,255,0.4)',
      },
      keyframes: {
        slideUp: {
          from: { opacity: '0', transform: 'translateY(30px) scale(0.97)' },
          to: { opacity: '1', transform: 'none' },
        },
        bookIn: {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to: { opacity: '1', transform: 'none' },
        },
        fadeIn: {
          from: { opacity: '0', transform: 'translateY(6px)' },
          to: { opacity: '1', transform: 'none' },
        },
      },
      animation: {
        slideUp: 'slideUp 0.55s cubic-bezier(0.16,1,0.3,1)',
        bookIn: 'bookIn 0.5s ease backwards',
        fadeIn: 'fadeIn 0.4s ease',
      },
    },
  },
  plugins: [],
}
