import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  define: {
    // Stringify the API key to ensure it's treated as a constant string in the bundle
    'process.env.API_KEY': JSON.stringify(process.env.API_KEY)
  },
  build: {
    chunkSizeWarningLimit: 2000,
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom'],
          'vendor-lib': ['@google/genai', '@supabase/supabase-js', 'jszip'],
          'vendor-ui': ['lucide-react', 'react-markdown', 'remark-gfm']
        }
      }
    }
  }
});