/** @type {import('tailwindcss').Config} */
module.exports = {
  // 啟用 class-based dark mode
  darkMode: 'class',

  // 確保掃描到 app/, pages/, components/ 下所有 TSX/JSX/MDX
  content: [
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
  ],

  theme: {
    extend: {
      colors: {
        // 你的自訂顏色
        'cyber-blue':  '#00f3ff',
        'cyber-purple':'#8b5cf6',
        'cyber-pink':  '#f97316',
        'neon-green':  '#00ff88',
        'dark-bg':     '#0a0a0a',
        'card-bg':     'rgba(15, 23, 42, 0.8)',

        // 如果你有在 global.css 用到 `border-border`
        border:       'rgba(255,255,255,0.1)',
        
        // Enhanced color palette
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        accent: {
          blue: '#00f3ff',
          purple: '#8b5cf6',
          pink: '#f97316',
          green: '#00ff88',
        }
      },
      backgroundImage: {
        'gradient-radial':  'radial-gradient(var(--tw-gradient-stops))',
        'neon-gradient':    'linear-gradient(135deg, #00f3ff 0%, #8b5cf6 50%, #f97316 100%)',
        'cyber-gradient':   'linear-gradient(45deg, #6366f1, #8b5cf6, #d946ef)',
        'dark-gradient':    'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
        'mesh-gradient':    'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        'aurora':           'linear-gradient(90deg, #00f3ff, #8b5cf6, #f97316, #00ff88)',
      },
      boxShadow: {
        neon:           '0 0 20px rgba(0, 243, 255, 0.5)',
        'neon-purple':  '0 0 20px rgba(139, 92, 246, 0.5)',
        'neon-pink':    '0 0 20px rgba(249, 115, 22, 0.5)',
        'neon-green':   '0 0 20px rgba(0, 255, 136, 0.5)',
        cyber:          '0 4px 20px rgba(99, 102, 241, 0.3)',
        'glow-sm':      '0 0 10px rgba(0, 243, 255, 0.3)',
        'glow-md':      '0 0 20px rgba(0, 243, 255, 0.4)',
        'glow-lg':      '0 0 30px rgba(0, 243, 255, 0.5)',
        'glow-xl':      '0 0 40px rgba(0, 243, 255, 0.6)',
      },
      animation: {
        'pulse-slow':   'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        glow:           'glow 2s ease-in-out infinite alternate',
        float:          'float 6s ease-in-out infinite',
        'gradient':     'gradient 8s linear infinite',
        'bounce-slow':  'bounce 3s infinite',
        'spin-slow':    'spin 3s linear infinite',
        'ping-slow':    'ping 3s cubic-bezier(0, 0, 0.2, 1) infinite',
      },
      keyframes: {
        glow: {
          '0%':   { boxShadow: '0 0 5px rgba(0, 243, 255, 0.5)' },
          '100%': { boxShadow: '0 0 25px rgba(0, 243, 255, 0.8)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%':      { transform: 'translateY(-10px)' },
        },
        gradient: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
      fontFamily: {
        'cyber': ['Orbitron', 'monospace'],
      },
    },
  },

  // Remove the incorrect plugin syntax
  plugins: [],
}
