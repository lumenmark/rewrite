import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        background: resolve(__dirname, 'src/background/background.ts'),
        contentScript: resolve(__dirname, 'src/content/contentScript.ts'),
        options: resolve(__dirname, 'src/options/options.html'),
      },
      output: {
        entryFileNames: (chunk) => {
          if (chunk.name === 'background') return 'background.js';
          if (chunk.name === 'contentScript') return 'contentScript.js';
          if (chunk.name === 'options') return 'options.js';
          return '[name].js';
        },
        assetFileNames: (assetInfo) => {
          if (assetInfo.name === 'popup.css') return 'popup.css';
          if (assetInfo.name === 'options.html') return 'options.html';
          return '[name].[ext]';
        },
      }
    },
    copyPublicDir: true,
  },
  publicDir: 'public',
});
