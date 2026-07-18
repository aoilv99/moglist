/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/renderer/**/*.{html,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#8B6F47',
        secondary: '#D9B892',
        surface: '#FFFFFF',
        background: '#FFF9F2',
        success: '#4F9D69',
        warning: '#E3A84B',
        danger: '#D95D5D',
        'text-base': '#2F2A25',
        muted: '#7A7168'
      },
      fontFamily: {
        sans: ['"Hiragino Maru Gothic ProN"', '"Yu Gothic"', 'sans-serif']
      },
      keyframes: {
        mascotIdle: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' }
        },
        mascotEating: {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(0.93)' }
        },
        mascotThinking: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.55' }
        },
        mascotSuccess: {
          '0%': { transform: 'scale(1) rotate(0deg)' },
          '30%': { transform: 'scale(1.15) rotate(-4deg)' },
          '60%': { transform: 'scale(1.1) rotate(4deg)' },
          '100%': { transform: 'scale(1) rotate(0deg)' }
        },
        mascotError: {
          '0%, 100%': { transform: 'translateX(0)' },
          '25%': { transform: 'translateX(-4px)' },
          '75%': { transform: 'translateX(4px)' }
        }
      },
      animation: {
        'mascot-idle': 'mascotIdle 2.4s ease-in-out infinite',
        'mascot-eating': 'mascotEating 0.5s ease-in-out infinite',
        'mascot-thinking': 'mascotThinking 1.2s ease-in-out infinite',
        'mascot-success': 'mascotSuccess 0.6s ease-in-out 1',
        'mascot-error': 'mascotError 0.4s ease-in-out 2'
      }
    }
  },
  plugins: []
}
