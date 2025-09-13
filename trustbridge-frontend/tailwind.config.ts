import type { Config } from 'tailwindcss'

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Brand colors (same for both modes)
        'neon-green': '#0FA968',
        'electric-mint': '#14F195',
        'deep-forest': '#064E3B',
        'success': '#14F195',
        'warning': '#F5A623',
        'error': '#F5143F',
        'info': '#3B82F6',
        
        // Dark mode colors
        'black': '#0A0A0A',
        'off-black': '#151515',
        'dark-gray': '#1F1F1F',
        'medium-gray': '#2A2A2A',
        'light-gray': '#3A3A3A',
        'off-white': '#FAFAF8',
        'pure-white': '#FFFFFF',
        
        // Light mode colors
        'light-bg': '#FFFFFF',
        'light-surface': '#F8FAFC',
        'light-card': '#FFFFFF',
        'light-border': '#E2E8F0',
        'light-text': '#1E293B',
        'light-text-secondary': '#64748B',
        'light-accent': '#0FA968',
        'light-accent-light': '#14F195',
        
        // Semantic colors that work in both modes
        'primary': {
          DEFAULT: '#0FA968',
          light: '#14F195',
          dark: '#064E3B',
        },
        'secondary': {
          DEFAULT: '#14F195',
          light: '#4ADE80',
          dark: '#0FA968',
        },
        'background': {
          DEFAULT: 'var(--bg-primary)',
          secondary: 'var(--bg-secondary)',
          tertiary: 'var(--bg-tertiary)',
        },
        'text': {
          primary: 'var(--text-primary)',
          secondary: 'var(--text-secondary)',
          tertiary: 'var(--text-tertiary)',
          inverse: 'var(--text-inverse)',
        },
        'border': {
          DEFAULT: 'var(--border-primary)',
          secondary: 'var(--border-secondary)',
          accent: 'var(--border-accent)',
        },
      },
      fontFamily: {
        'primary': ['Space Grotesk', 'sans-serif'],
        'secondary': ['Inter', 'sans-serif'],
        'mono': ['JetBrains Mono', 'monospace'],
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'rotate': 'rotate 20s linear infinite',
        'slide-in': 'slide-in 0.5s ease-out',
        'glitch': 'glitch 0.3s ease-in-out',
        'morph': 'morph 8s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0) rotate(0deg)' },
          '50%': { transform: 'translateY(-10px) rotate(180deg)' },
        },
        'pulse-glow': {
          '0%, 100%': { opacity: '0.3' },
          '50%': { opacity: '0.6' },
        },
        rotate: {
          from: { transform: 'rotate(0deg)' },
          to: { transform: 'rotate(360deg)' },
        },
        'slide-in': {
          from: { opacity: '0', transform: 'translateX(-30px)' },
          to: { opacity: '1', transform: 'translateX(0)' },
        },
        glitch: {
          '0%, 100%': { textShadow: '2px 2px #0FA968' },
          '25%': { textShadow: '-2px -2px #14F195' },
          '50%': { textShadow: '2px -2px #0FA968' },
        },
        morph: {
          '0%, 100%': { borderRadius: '30% 70% 70% 30% / 30% 30% 70% 70%' },
          '50%': { borderRadius: '70% 30% 30% 70% / 70% 70% 30% 30%' },
        },
      },
      boxShadow: {
        'neon': '0 0 10px #0FA968, 0 0 20px #0FA968, 0 0 30px #0FA968, inset 0 0 10px #0FA968',
        'neon-mint': '0 0 10px #14F195, 0 0 20px #14F195, 0 0 30px #14F195',
        'glow': '0 0 20px rgba(20, 241, 149, 0.2)',
        'light-card': '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        'light-card-hover': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      },
    },
  },
  plugins: [],
} satisfies Config