import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { nodePolyfills } from 'vite-plugin-node-polyfills';
import path from 'path';

export default defineConfig({
  plugins: [
    react(),
    nodePolyfills({
      // To include specific polyfills, add them here.
      // For example: include: ['path', 'stream', 'util']
      include: ['buffer', 'process', 'util', 'stream', 'crypto', 'os', 'path', 'fs'],
      globals: {
        Buffer: true, // can also be 'buffer'
        global: true,
        process: true,
      },
      protocolImports: true,
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  optimizeDeps: {
    include: [
      '@hashgraph/sdk',
      '@hashgraph/hedera-wallet-connect',
      '@walletconnect/modal'
    ],
    exclude: [
      // Exclude problematic packages from optimization
    ]
  },
  build: {
    commonjsOptions: {
      include: [/node_modules/],
      transformMixedEsModules: true,
    },
    sourcemap: false, // Disable sourcemaps for problematic packages
  },
  server: {
    port: 3001,
    open: true,
    host: true,
    hmr: {
      port: 3001,
    },
    fs: {
      allow: ['..'],
    },
  },
  esbuild: {
    jsx: 'automatic',
  },
  define: {
    global: 'globalThis',
    'process.env': {},
    'process.env.NODE_ENV': '"development"',
    'process.env.LOG_LEVEL': '"info"',
    'process.env.NODE_DEBUG': 'false',
  },
});