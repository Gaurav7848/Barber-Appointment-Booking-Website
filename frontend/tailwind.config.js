/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#d4af37',
        secondary: '#1a1a1a',
        accent: '#f5f5f5',
        dark: '#0a0a0a',
      },
    },
  },
  plugins: [],
}
