import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import electron from 'vite-plugin-electron/simple'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
    root: path.join(__dirname, 'src/renderer'),
    plugins: [
        react(),
        electron({
            main: {
                entry: path.resolve(__dirname, 'src/main/index.ts'),
                vite: {
                    build: {
                        outDir: path.resolve(__dirname, 'dist-electron/main'),
                        rollupOptions: {
                            external: ['electron', 'electron-store', 'electron-log']
                        }
                    }
                }
            },
            preload: {
                input: path.resolve(__dirname, 'src/preload/index.ts'),
                vite: {
                    build: {
                        outDir: path.resolve(__dirname, 'dist-electron/preload')
                    }
                }
            },
            renderer: {}
        })
    ],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src/renderer/src'),
            '@shared': path.resolve(__dirname, './src/shared')
        }
    },
    base: './',
    build: {
        outDir: path.resolve(__dirname, 'dist'),
        emptyOutDir: true
    }
})
