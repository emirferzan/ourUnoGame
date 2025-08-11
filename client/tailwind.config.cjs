/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      keyframes: {
        pop: {
          '0%':   { transform: 'scale(1)' },
          '40%':  { transform: 'scale(1.15)' },
          '100%': { transform: 'scale(1)' }
        },
        glow: {
          '0%':   { transform: 'scale(1)',   boxShadow: '0 0 0 0 rgba(16,185,129,0.0)' },
          '50%':  { transform: 'scale(1.04)',boxShadow: '0 0 32px 6px rgba(16,185,129,0.45)' },
          '100%': { transform: 'scale(1)',   boxShadow: '0 0 0 0 rgba(16,185,129,0.0)' }
        }
      },
      animation: {
        pop: 'pop 300ms ease-out',
        glow: 'glow 1.2s ease-in-out infinite'
      }
    }
  },
  plugins: []
};
