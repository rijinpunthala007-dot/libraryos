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
        serif: ['Lora', 'Georgia', 'serif'],
      },
      colors: {
        glass: {
          border: '#D4C5B9',
          bg: '#FFFFFF',
          bgHover: '#F5F0EB',
        },
        surface: {
          base: '#FAF9F6',
          dim: '#F5F0EB',
          low: '#FAF9F6',
          DEFAULT: '#FFFFFF',
          high: '#FFFFFF',
          highest: '#E5E7EB',
          bright: '#D4C5B9',
        },
        brand: {
          primary: '#8B0000',
          primaryLight: '#A30000',
          secondary: '#1B4332',
          secondaryLight: '#2D5B46',
          amber: '#D4A574',
          amberLight: '#E3C19E',
          error: '#8B0000',
          errorLight: '#FEE2E2',
        },
        text: {
          DEFAULT: '#2C3E50',
          muted: '#6B7280',
          dim: '#9CA3AF',
        },
        academic: {
          cream: '#FAF9F6',
          card: '#FFFFFF',
          burgundy: '#8B0000',
          forest: '#1B4332',
          gold: '#D4A574',
          charcoal: '#2C3E50',
          gray: '#6B7280',
          border: '#D4C5B9',
          hover: '#F5F0EB',
          lightGreen: '#DCFCE7',
          lightRed: '#FEE2E2',
          lightGold: '#FEF3C7',
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
