import { defineConfig, loadEnv } from 'vite';
import vue from '@vitejs/plugin-vue';
import tailwindcss from '@tailwindcss/vite';
import path from 'node:path';
import https from 'node:https';

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    plugins: [vue(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      proxy: {
        '/api': {
          target: env.VITE_API_BASE_URL || 'https://api.sirch01.com',
          changeOrigin: true,
          secure: false, // Bypass certificate validation
          rewrite: (path) => path, // Keep /api in the path
          agent: new https.Agent({
            rejectUnauthorized: false, // Bypass certificate validation for development
          }),
        },
      },
    },
  };
});
