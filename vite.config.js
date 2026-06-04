import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import { readFileSync } from 'fs'

const pkg = JSON.parse(readFileSync('./package.json', 'utf-8'))

// https://vite.dev/config/
export default defineConfig({
  define: {
    'import.meta.env.VITE_APP_VERSION': JSON.stringify(pkg.version),
  },
  plugins: [
    tailwindcss(),
  ],
  base: '/',
  css: {
    postcss: {}
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug', 'console.warn']
      }
    },
    rollupOptions: {},
    cssCodeSplit: false,
    copyPublicDir: true
  },
  server: {
    host: true,
    allowedHosts: ['localhost', '127.0.0.1']
  },
  preview: {
    host: true,
    allowedHosts: ['localhost', '127.0.0.1']
  }
}) 