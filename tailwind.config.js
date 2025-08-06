/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#000000',
        secondary: '#ffffff',
        accent: '#47A979',
        highline: '#704786',
        waterline: '#18abc9',
        parkline: '#bfa33f',
      },
    },
  },
  plugins: [],
}
