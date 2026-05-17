import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';
import { viteSingleFile } from 'vite-plugin-singlefile';
import solidPlugin from 'vite-plugin-solid';
import { resolve } from 'node:path';

const FIGMA_RUNTIME_TARGET = 'es2019';

export default defineConfig(({ mode }) => {
  if (mode === 'plugin') {
    return {
      build: {
        target: FIGMA_RUNTIME_TARGET,
        outDir: 'dist',
        emptyOutDir: false,
        lib: {
          entry: resolve(process.cwd(), 'src/plugin/code.ts'),
          name: 'FontclusterApplyPlugin',
          formats: ['iife'],
          fileName: () => 'code.js',
        },
      },
    };
  }

  return {
    base: './',
    plugins: [solidPlugin(), tailwindcss(), viteSingleFile()],
    server: {
      port: 3000,
    },
    build: {
      target: FIGMA_RUNTIME_TARGET,
    },
  };
});
