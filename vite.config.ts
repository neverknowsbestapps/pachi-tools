import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  // アセットを相対パスで参照（GitHub Pages のサブフォルダ配信でも動くように）
  base: './',
  plugins: [react()],
})
