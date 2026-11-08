import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { cloudflare } from '@cloudflare/vite-plugin'
import { defineConfig } from 'vite'
import path from 'node:path'

export default defineConfig({
  plugins: [react(), tailwindcss(), cloudflare({ persistState: process.env.DEMO_STATE ? { path: process.env.DEMO_STATE } : undefined })],
  resolve: { alias: { '@': path.resolve(__dirname, 'src') } },
})
