/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#F8FAFC',
        sidebar: '#0F172A',
        primary: { DEFAULT: '#2563EB', hover: '#1D4ED8' },
        secondary: '#1E40AF',
        accent: '#14B8A6',
        card: '#FFFFFF',
        borderline: '#E2E8F0',
        content: { primary: '#0F172A', secondary: '#475569', muted: '#64748B' },
        warning: '#F59E0B',
        success: '#16A34A',
        danger: '#EF4444',
      }
    },
  },
  plugins: [],
}
