// Ensure Tailwind and Autoprefixer run in Vite's PostCSS pipeline
export default {
  plugins: {
    '@tailwindcss/postcss': {},
    autoprefixer: {},
  },
}

