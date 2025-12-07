import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'clean-console',
      configureServer(server) {
        server.httpServer?.on('listening', () => {
          setTimeout(() => {
            console.log('\n  ➜  Local:   http://localhost:5173/');
            console.log('  ➜  Network: http://192.168.1.10:5173/\n');
          }, 100);
        });
      },
    },
  ],
  logLevel: 'warn', // Suppress default info logs including the long network list
  server: {
    host: '0.0.0.0', // Allow external access from mobile devices
    port: 5173,
    strictPort: false,
    open: false,
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});