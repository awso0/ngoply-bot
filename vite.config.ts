import { defineConfig } from 'vite'
import { resolve } from 'path'
import { fileURLToPath } from 'url'

const __dirname = fileURLToPath(new URL('.', import.meta.url))

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'NgoplyMonitor',
      fileName: 'index',
      formats: ['es']
    },
    rollupOptions: {
      external: ['discord.js', 'axios', 'dotenv', 'cheerio', 'cron'],
      output: {
        globals: {
          'discord.js': 'Discord',
          'axios': 'axios',
          'dotenv': 'dotenv',
          'cheerio': 'cheerio',
          'cron': 'cron'
        }
      }
    },
    target: 'node18',
    outDir: 'dist',
    emptyOutDir: true
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  }
})