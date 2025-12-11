import {defineConfig} from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: {
            // Allow importing local assets with @local-assets/
            '@local-assets': '/Users/mchioti/Documents/Cursor-PB/input/claude-dino'
        }
    },
    server: {
        cors: true,
        allowedHosts: true,
        host: '0.0.0.0',
        fs: {
            // Allow serving files from the local assets folder
            allow: [
                // Default workspace
                '.',
                // Local assets folder
                '/Users/mchioti/Documents/Cursor-PB/input/claude-dino'
            ]
        }
    }
})