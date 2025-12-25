/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Greek mythology-inspired palette
        olympus: {
          navy: '#0f1b2e',
          gold: '#d4af37',
          'gold-light': '#f4d47f',
          marble: '#f5f5f0',
          stone: '#8b8680',
          bronze: '#cd7f32',
        },
        // Functional colors
        atlas: {
          workout: '#e74c3c',
          meal: '#2ecc71',
          work: '#34495e',
          sleep: '#9b59b6',
          other: '#3498db',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Cinzel', 'Georgia', 'serif'],
      },
    },
  },
  plugins: [],
}
