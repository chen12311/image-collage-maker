import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@/core': resolve(__dirname, 'src/core'),
      '@/layout': resolve(__dirname, 'src/layout'),
      '@/components': resolve(__dirname, 'src/components')
    }
  },
  build: {
    target: 'es2020',
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor': ['vue'],
          'core': ['./src/core/models/Element.ts', './src/core/models/Transform.ts', './src/core/models/GridConfig.ts'],
          'layout': ['./src/layout/GridSystem.ts', './src/layout/LayoutEngine.ts']
        }
      }
    }
  }
})
