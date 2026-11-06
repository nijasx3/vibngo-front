import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// base './' + HashRouter : le build statique fonctionne sur n'importe quel hébergement
// (Vercel, Netlify, GitHub Pages, simple dossier) sans règle de réécriture.
export default defineConfig({
  base: './',
  plugins: [react(), tailwindcss()],
  test: { environment: 'node', include: ['src/**/*.test.ts'] },
});
