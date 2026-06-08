
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig(() => {
  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve((process as any).cwd(), './'),
      },
    },
    build: {
      outDir: 'dist',
      chunkSizeWarningLimit: 900,
      rollupOptions: {
        input: {
          main: path.resolve((process as any).cwd(), 'index.html'),
        },
        output: {
          // Split heavy third-party libs into cacheable vendor chunks so they
          // are shared across lazy-loaded pages instead of duplicated.
          manualChunks: {
            'vendor-react': ['react', 'react-dom', 'react-router-dom'],
            'vendor-three': ['three', '@react-three/fiber', '@react-three/drei'],
            'vendor-charts': ['recharts'],
            'vendor-motion': ['framer-motion'],
          },
        },
      },
    },
    // NOTE: The Gemini API key is deliberately NOT exposed to the client. AI
    // requests go through the backend proxy (services/aiService.ts ->
    // backend/src/server.ts). VITE_-prefixed vars are read via import.meta.env
    // and need no define here.
  };
});
