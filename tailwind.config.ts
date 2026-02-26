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
          dark: '#0a0a0f',
          card: '#12121a',
          border: '#1e1e2e',
          purple: '#8b5cf6',
          blue: '#3b82f6',
          glow: '#a78bfa',
        },
      },
      backgroundImage: {
        'gradient-neural': 'linear-gradient(135deg, #1e1b4b 0%, #0f172a 50%, #0c0a1d 100%)',
        'gradient-glow': 'linear-gradient(180deg, rgba(139,92,246,0.15) 0%, rgba(59,130,246,0.1) 100%)',
      },
      boxShadow: {
        glow: '0 0 40px rgba(139, 92, 246, 0.3)',
        'glow-sm': '0 0 20px rgba(139, 92, 246, 0.2)',
      },
      animation: {
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 20px rgba(139, 92, 246, 0.2)' },
          '50%': { boxShadow: '0 0 40px rgba(139, 92, 246, 0.4)' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
