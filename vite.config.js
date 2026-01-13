import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import checker from 'vite-plugin-checker';

export default defineConfig({
    plugins: [
        react(),
        tailwindcss(),
        checker({
            eslint: {
                lintCommand: 'eslint .',
                useFlatConfig: true
            }
        })
    ],
    resolve: { alias: { '@': '/src' } },
    server: {
        port: '5174',
        host: '0.0.0.0',
        open: true
    }
});
