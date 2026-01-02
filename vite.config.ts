import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  define: {
    // Inject the environment variable safely into the client bundle
    'process.env.API_KEY': JSON.stringify(process.env.API_KEY)
  },
  build: {
    // Increase the limit slightly and use aggressive chunking
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('@google/genai')) return 'vendor-ai';
            if (id.includes('lucide-react')) return 'vendor-icons';
            if (id.includes('react-markdown') || id.includes('remark-gfm')) return 'vendor-markdown';
            if (id.includes('@supabase')) return 'vendor-db';
            return 'vendor-core';
          }
        }
      }
    }
  }
});