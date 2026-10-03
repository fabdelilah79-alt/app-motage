import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// Éditeur sur http://localhost:5173 ; /api et /files sont relayés vers le serveur local (:3210).
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    strictPort: true,
    proxy: {
      '/api': 'http://127.0.0.1:3210',
      '/files': 'http://127.0.0.1:3210',
    },
  },
});
