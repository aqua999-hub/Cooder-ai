
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  define: {
    // This shims process.env so the Gemini SDK can access the API key 
    // without causing a runtime error in the browser.
    'process.env': {
      API_KEY: process.env.API_KEY
    }
  },
  build: {
    chunkSizeWarningLimit: 2000,
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom'],
          'vendor-icons': ['lucide-react'],
          'vendor-utils': ['jszip', '@google/genai', '@supabase/supabase-js']
        }
      }
    }
  }
});
