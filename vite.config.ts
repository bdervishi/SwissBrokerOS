
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
      rollupOptions: {
        input: {
          main: path.resolve((process as any).cwd(), 'index.html'),
          admin: path.resolve((process as any).cwd(), 'admin.html'),
          broker: path.resolve((process as any).cwd(), 'broker.html'),
          client: path.resolve((process as any).cwd(), 'client.html'),
        },
      },
    },
    // NOTE: The Gemini API key is deliberately NOT exposed to the client. AI
    // requests go through the backend proxy (services/aiService.ts ->
    // backend/src/server.ts). VITE_-prefixed vars are read via import.meta.env
    // and need no define here.
  };
});
