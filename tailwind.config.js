export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    // Tailwind v4 uses @theme in index.css for tokens.
    // This config exists so the CLI happily finds content files.
    extend: {},
  },
  plugins: [],
}
