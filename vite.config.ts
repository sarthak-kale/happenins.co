import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    build: {
      rollupOptions: {
        output: {
          // Stable vendor chunks cache across deploys; heavy libs stay out of the entry chunk
          manualChunks(id: string) {
            // Vite's own runtime helpers must not land inside a lazy vendor chunk (it would be preloaded eagerly)
            if (id.includes('vite/preload-helper') || id.includes('commonjsHelpers') || id.includes('vite/modulepreload-polyfill')) return 'vendor-react';
            if (!id.includes('node_modules')) return undefined;
            if (/node_modules\/(three|@react-three|postprocessing|three-stdlib|maath|meshline)/.test(id)) return 'vendor-three';
            if (/node_modules\/(react|react-dom|scheduler)\//.test(id)) return 'vendor-react';
            if (/node_modules\/(motion|framer-motion|motion-dom|motion-utils)/.test(id)) return 'vendor-motion';
            if (/node_modules\/lucide-react/.test(id)) return 'vendor-icons';
            if (/node_modules\/(recharts|d3-|victory-vendor|recharts-scale|internmap)/.test(id)) return 'vendor-charts';
            if (/node_modules\/(html5-qrcode|qrcode)/.test(id)) return 'vendor-qr';
            return undefined;
          },
        },
      },
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
