import { resolve } from 'node:path'
import react from '@vitejs/plugin-react'
import { defineConfig, externalizeDepsPlugin } from 'electron-vite'

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()],
    build: {
      target: 'node18',
      rollupOptions: {
        output: {
          entryFileNames: '[name].cjs'
        }
      }
    },
    resolve: {
      alias: {
        '@main': resolve('src/main')
      }
    }
  },
  preload: {
    plugins: [externalizeDepsPlugin()],
    build: {
      target: 'node18',
      rollupOptions: {
        output: {
          entryFileNames: '[name].cjs'
        }
      }
    },
    resolve: {
      alias: {
        '@preload': resolve('src/preload')
      }
    }
  },
  renderer: {
    build: {
      target: 'esnext'
    },
    resolve: {
      alias: {
        '@': resolve('src/renderer'),
        '@components': resolve('src/renderer/components'),
        '@stores': resolve('src/renderer/stores'),
        '@hooks': resolve('src/renderer/hooks'),
        '@lib': resolve('src/renderer/lib'),
        '@types': resolve('src/renderer/types')
      }
    },
    plugins: [react()]
  }
})
