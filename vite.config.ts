import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [tailwindcss()],
  build: {
    assetsInlineLimit: 4096,
  },
  publicDir: 'public',
})
