import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './'),
            '@lib': path.resolve(__dirname, 'lib'),
            '@components': path.resolve(__dirname, 'components'),
            '@styles': path.resolve(__dirname, 'styles'),
        },
    },
})