import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { nodePolyfills } from 'vite-plugin-node-polyfills'

export default defineConfig({
  plugins: [
    react({
      jsxRuntime: 'automatic'
    }),
    nodePolyfills({
      // Whether to polyfill `node:` protocol imports.
      protocolImports: true,
    })
  ],
  css: {
    postcss: './postcss.config.js',
  },
  server: {
    port: 3001,
    open: true
  },
  esbuild: {
    jsx: 'automatic'
  },
  define: {
    global: 'globalThis',
  },
  optimizeDeps: {
    include: ['buffer', '@walletconnect/web3-provider']
  }
})