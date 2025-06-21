import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
   css: {
    modules: {
      // Cấu hình cho CSS Modules
      localsConvention: 'camelCase', // Chuyển className sang camelCase
      generateScopedName: '[name]__[local]___[hash:base64:5]', // Định dạng tên class
    },
    preprocessorOptions: {
      less: {
        // Các tùy chỉnh cho Less nếu cần
        javascriptEnabled: true,
      },
    },
  },
})
