import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';

// The Neon client lives in `server/` only. The browser talks to it through
// this proxy so DATABASE_URL never reaches the bundle.
const API_PORT = process.env.API_PORT || '8787';

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  server: {
    port: 3001,
    open: true,
    proxy: {
      '/api': {
        target: `http://localhost:${API_PORT}`,
        changeOrigin: true,
      },
    },
  },
  build: {
    target: 'esnext',
    // Sourcemaps stay local: they add ~4 MB to the deploy for no user benefit.
    sourcemap: false,
  },
});
