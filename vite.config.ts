import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// Éditeur sur http://localhost:5173 ; les appels /api sont relayés vers le serveur local (Fastify, :3210).
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    strictPort: true,
    proxy: {
      '/api': 'http://127.0.0.1:3210',
    },
  },
});
