import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // เปิดให้สามารถเข้าถึงจาก IP Address ภายนอกได้
    port: 5173, // พอร์ตที่ต้องการให้ Vite Server รัน
    allowedHosts: ['.ngrok-free.app', '6924-49-229-171-250.ngrok-free.app']
  }
})
