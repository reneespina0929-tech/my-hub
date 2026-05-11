/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'strawberry': '#FFD1DC',
        'mint': '#E0FFF0',
        'honey': '#FFF4BD',
        'chocolate': '#4E342E',
        'soft-white': '#FAFAFA',
      },
      borderRadius: {
        'button': '20px',
        'card': '40px',
      }
    },
  },
  plugins: [],
}