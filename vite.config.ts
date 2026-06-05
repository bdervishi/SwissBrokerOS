
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, (process as any).cwd(), '');

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
    define: {
      // This is necessary because the code uses `process.env.API_KEY`
      // Vite normally uses `import.meta.env`. This polyfills it for production.
      'process.env.API_KEY': JSON.stringify(env.API_KEY || null),
      'process.env.VITE_SUPABASE_URL': JSON.stringify(env.VITE_SUPABASE_URL || ''),
      'process.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(env.VITE_SUPABASE_ANON_KEY || ''),
      'process.env.VITE_USE_MOCK_DATA': JSON.stringify(env.VITE_USE_MOCK_DATA || 'true'),
    },
  };
});
