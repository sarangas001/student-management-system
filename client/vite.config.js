import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(),tailwindcss(),],
  server: {
    allowedHosts: [
      "http://a07efaf2e4de44f449d7144b31ba3853-131990732.ap-south-1.elb.amazonaws.com",
      "http://a3b33f38c7124489294eef3116ba6f34-1750585107.ap-south-1.elb.amazonaws.com"
    ]
  }
})
