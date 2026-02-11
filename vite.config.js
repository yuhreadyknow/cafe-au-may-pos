import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/cafe-au-may-pos/',  // ← must match your GitHub repo name
})
