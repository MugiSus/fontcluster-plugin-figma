import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';
import { viteSingleFile } from 'vite-plugin-singlefile';
import solidPlugin from 'vite-plugin-solid';
import { resolve } from 'node:path';

// Figma statically parses plugin code with an ES2018-level parser, so the
// build must not emit ES2019+ syntax (e.g. optional catch binding `catch {}`).
const FIGMA_RUNTIME_TARGET = 'es2018';

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
