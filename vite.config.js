import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/renewable_energy_platform/',
  server: {
    port: 3000
  }
})