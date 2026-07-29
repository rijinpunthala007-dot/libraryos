/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        glass: {
          border: 'rgba(255,255,255,0.07)',
          bg: 'rgba(255,255,255,0.03)',
          bgHover: 'rgba(255,255,255,0.07)',
        },
        surface: {
          base: '#111827',
          dim: '#0d131e',
          low: '#151e2b',
          DEFAULT: '#1F2937',
          high: '#253040',
          highest: '#374151',
          bright: '#4B5563',
        },
        brand: {
          primary: '#3B82F6',
          primaryLight: '#93C5FD',
          secondary: '#06B6D4',
          secondaryLight: '#67E8F9',
          amber: '#F59E0B',
          amberLight: '#FCD34D',
          error: '#EF4444',
          errorLight: '#FCA5A5',
        },
        text: {
          DEFAULT: '#F3F4F6',
          muted: '#D1D5DB',
          dim: '#9CA3AF',
        }
      },
      backdropBlur: {
        glass: '20px',
        modal: '40px',
      },
      boxShadow: {
        glass: 'inset 0 1px 0 rgba(255,255,255,0.1), 0 8px 32px rgba(0,0,0,0.4)',
        card: '0 4px 24px rgba(0,0,0,0.4)',
        glow: '0 0 40px rgba(99,102,241,0.15)',
      },
      animation: {
        'slide-up': 'slideUp 0.3s ease-out',
        'fade-in': 'fadeIn 0.2s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
      },
      keyframes: {
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
