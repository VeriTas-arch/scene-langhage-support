import { defineConfig } from 'vite';

export default defineConfig({
    build: {
        lib: {
            entry: 'media/js/three-entry.js',
            name: 'THREE',
            fileName: () => 'three.min.js',
            formats: ['iife']
        },
        outDir: 'media/js',
        emptyOutDir: false,
        sourcemap: false
    }
});