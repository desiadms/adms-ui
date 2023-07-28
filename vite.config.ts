import preact from '@preact/preset-vite'
import { defineConfig } from 'vite'
import checker from 'vite-plugin-checker'
import { VitePWA } from 'vite-plugin-pwa'
import ViteRestart from 'vite-plugin-restart'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        runtimeCaching: [
          {
            urlPattern:
              'https://cgjgnshvokexivmuttxh.storage.eu-central-1.nhost.run/*',
            handler: 'NetworkFirst'
          }
        ]
      }
    }),
    preact(),
    ViteRestart({
      restart: ['.eslintrc*', '.prettierrc*', 'tsconfig.json']
    }),
    checker({
      eslint: {
        // for example, lint .ts and .tsx
        lintCommand: 'eslint "./src/**/*.{ts,tsx}"'
      },
      overlay: false,

      enableBuild: false
    })
  ],
  optimizeDeps: {
    include: ['preact/hooks', 'preact/compat', 'preact']
  },
  server: {
    host: true,
    proxy: {
      '/api': { target: 'http://localhost:5050', secure: false }
    }
  },
  resolve: {
    alias: [
      { find: 'react', replacement: 'preact/compat' },
      { find: 'react-dom', replacement: 'preact/compat' },
      { find: 'react/jsx-runtime', replacement: 'preact/jsx-runtime' }
    ]
  }
})
