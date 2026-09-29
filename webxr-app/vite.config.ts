import { defineConfig } from 'vite';
import basicSsl from '@vitejs/plugin-basic-ssl';

export default defineConfig({
  plugins: [basicSsl()],
  server: {
    host: true,
    port: 5173,
    allowedHosts: ['.trycloudflare.com', '.ngrok-free.app'],
  },
  build: {
    target: 'es2020',
    sourcemap: true,
  },
});
