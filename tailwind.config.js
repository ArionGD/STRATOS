/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        obsidian: {
          DEFAULT: '#0F172A',
          deep: '#0A0F1C',
        },
        'accent-blue': '#1E40AF',
        primary: {
          DEFAULT: '#1E40AF',
          hover: '#2563EB',
          light: '#E6F7FF',
        },
        surface: {
          DEFAULT: '#FFFFFF',
          raised: '#F8FAFC',
          muted: '#F1F5F9',
          border: '#E2E8F0',
        },
        ink: {
          DEFAULT: '#0F172A',
          secondary: '#64748B',
          tertiary: '#94A3B8',
        }
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      fontSize: {
        'base': ['15px', '1.6'],
      },
      boxShadow: {
        'glow-blue': '0 0 20px rgba(30, 64, 175, 0.2)',
      }
    },
  },
  plugins: [],
}
