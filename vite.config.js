import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import legacy from '@vitejs/plugin-legacy'
import { viteSingleFile } from 'vite-plugin-singlefile'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    tailwindcss(),
    legacy({
      targets: ['defaults', 'not IE 11'],
      additionalLegacyPolyfills: ['regenerator-runtime/runtime']
    }),
    viteSingleFile()
  ],
  base: './', // Use relative paths for production builds
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
        // Remove console logs in production
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug', 'console.warn']
      }
    },
    rollupOptions: {},
    cssCodeSplit: false, // Keep all CSS in one file
    // Copy PWA files to dist (includes sw.js, manifest.json, icons, etc.)
    copyPublicDir: true
  },
  // PWA optimizations
  server: {
    host: true, // Allow external connections
    allowedHosts: ['localhost', '127.0.0.1']
  },
  preview: {
    host: true,
    allowedHosts: ['localhost', '127.0.0.1']
  }
}) 