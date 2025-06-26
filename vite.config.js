import { defineConfig } from 'vite';

export default defineConfig({
    build: {
        lib: {
            entry: 'media/js/orbitcontrols-entry.js',
            name: 'OrbitControls',
            fileName: () => 'OrbitControls.bundle.js',
            formats: ['iife']
        },
        rollupOptions: {
            external: ['three'],
            output: {
                globals: {
                    three: 'THREE'
                }
            }
        },
        outDir: 'media/js',
        emptyOutDir: false
    }
});