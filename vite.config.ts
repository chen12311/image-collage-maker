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
    // 启用 CSS 代码分割
    cssCodeSplit: true,
    // 资源内联阈值（小于此大小的资源会被内联为 base64）
    assetsInlineLimit: 4096,
    // 优化依赖
    rollupOptions: {
      output: {
        // 手动分块，优化加载性能
        manualChunks: {
          'vendor': ['vue', 'pinia'],
          'i18n': ['vue-i18n']
        },
        // 资源文件命名（利于缓存）
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]'
      }
    },
    // 压缩配置
    minify: 'terser',
    terserOptions: {
      compress: {
        // 生产环境移除 console
        drop_console: true,
        drop_debugger: true
      }
    },
    // 生成 sourcemap（可选，生产环境可设为 false）
    sourcemap: false,
    // 报告压缩大小（可选，加快构建速度可设为 false）
    reportCompressedSize: true,
    // chunk 大小警告阈值（KB）
    chunkSizeWarningLimit: 1000
  },
  // 性能优化：预构建依赖
  optimizeDeps: {
    include: ['vue', 'pinia', 'vue-i18n']
  },
  // 服务器配置（开发环境）
  server: {
    // 预热常用文件
    warmup: {
      clientFiles: [
        './src/main.ts',
        './src/App.vue',
        './src/store/useAppStore.ts'
      ]
    }
  }
})
