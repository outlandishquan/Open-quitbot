import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './data/**/*.json',
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Bricolage Grotesque"', 'system-ui', 'sans-serif'],
        body: ['Figtree', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      colors: {
        og: {
          dark: '#0f0e0c',
          card: '#1a1917',
          border: '#2a2824',
          purple: '#00f0b5',
          blue: '#00c9a7',
          glow: '#00f0b5',
        },
      },
      backgroundImage: {
        'gradient-neural': 'linear-gradient(135deg, #0f0e0c 0%, #1a1917 50%, #0f0e0c 100%)',
        'gradient-glow': 'linear-gradient(180deg, rgba(0,240,181,0.12) 0%, rgba(245,166,35,0.06) 100%)',
      },
      boxShadow: {
        glow: '0 0 40px rgba(0, 240, 181, 0.2)',
        'glow-sm': '0 0 20px rgba(0, 240, 181, 0.12)',
        'glow-amber': '0 0 30px rgba(245, 166, 35, 0.15)',
      },
      animation: {
        'pulse-glow': 'pulse-glow 2.5s ease-in-out infinite',
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 20px rgba(0, 240, 181, 0.1)' },
          '50%': { boxShadow: '0 0 45px rgba(0, 240, 181, 0.25)' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
