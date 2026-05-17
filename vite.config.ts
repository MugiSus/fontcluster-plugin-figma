import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';
import solidPlugin from 'vite-plugin-solid';
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const FIGMA_RUNTIME_TARGET = 'es2019';

function figmaPluginBuild() {
  return {
    name: 'figma-plugin-build',
    apply: 'build' as const,
    closeBundle() {
      const distDir = resolve(process.cwd(), 'dist');
      const htmlPath = resolve(distDir, 'index.html');
      let html = readFileSync(htmlPath, 'utf8');

      html = html.replace(
        /<script type="module" crossorigin src="([^"]+)"><\/script>/g,
        (_tag, src: string) => {
          const assetPath = resolve(distDir, src.replace(/^\/|^\.\//, ''));
          const js = readFileSync(assetPath, 'utf8');

          return `<script>${js}</script>`;
        },
      );

      html = html.replace(
        /<link rel="stylesheet" crossorigin href="([^"]+)">/g,
        (_tag, href: string) => {
          const assetPath = resolve(distDir, href.replace(/^\/|^\.\//, ''));
          const css = readFileSync(assetPath, 'utf8');

          return `<style>${css}</style>`;
        },
      );

      writeFileSync(htmlPath, html);
    },
  };
}

export default defineConfig(({ mode }) => {
  if (mode === 'plugin') {
    return {
      build: {
        target: FIGMA_RUNTIME_TARGET,
        outDir: 'dist',
        emptyOutDir: false,
        lib: {
          entry: resolve(process.cwd(), 'src/code.ts'),
          name: 'FontclusterApplyPlugin',
          formats: ['iife'],
          fileName: () => 'code.js',
        },
      },
    };
  }

  return {
    base: './',
    plugins: [solidPlugin(), tailwindcss(), figmaPluginBuild()],
    server: {
      port: 3000,
    },
    build: {
      target: FIGMA_RUNTIME_TARGET,
      rollupOptions: {
        input: resolve(process.cwd(), 'index.html'),
        output: {
          entryFileNames: 'assets/[name]-[hash].js',
          chunkFileNames: 'assets/[name]-[hash].js',
          assetFileNames: 'assets/[name]-[hash][extname]',
        },
      },
    },
  };
});
