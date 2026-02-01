/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: { 500: '#3B82F6', 600: '#2563EB' },
        purple: { 500: '#9333EA', 600: '#7C3AED' },
        pink: { 500: '#EC4899', 600: '#DB2777' },
        success: '#10B981',
        warning: '#F59E0B',
        danger: '#EF4444',
      },
      backgroundImage: {
        'gradient-auth': 'linear-gradient(135deg, #3B82F6 0%, #9333EA 50%, #EC4899 100%)',
        'gradient-header': 'linear-gradient(90deg, #3B82F6 0%, #9333EA 100%)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
}
