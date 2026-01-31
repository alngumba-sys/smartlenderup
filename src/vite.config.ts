import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/', // Root path for Netlify
  optimizeDeps: {
    include: ['xlsx'] // Explicitly include xlsx for pre-bundling
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'esbuild',
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'supabase': ['@supabase/supabase-js'],
          'charts': ['recharts'],
          'icons': ['lucide-react'],
          'xlsx': ['xlsx'] // Add xlsx to manual chunks
        },
      },
    },
  },
  server: {
    port: 5173,
    strictPort: true,
  },
  preview: {
    port: 3000,
    strictPort: true,
  },
});