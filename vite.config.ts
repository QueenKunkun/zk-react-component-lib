/// <reference types="vitest" />

import path from "path"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"
import dts from 'vite-plugin-dts';
import { peerDependencies, dependencies } from './package.json'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), dts({
      include: ['src/**/*'],
    })],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src', 'index.ts'),
      formats: ['es', 'cjs'],
      fileName: (ext) => `index.${ext}.js`,
    },
    rollupOptions: {
      external: [...Object.keys(peerDependencies), ...Object.keys(dependencies)], output: { preserveModules: true, exports: 'named' }
    },
    
    target: 'esnext',
    sourcemap: true
  }
})
