import { resolve } from 'node:path'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'electron-vite'
import type { ConfigEnv, UserConfig } from 'electron-vite'

export default defineConfig((env: ConfigEnv): UserConfig => {
  return {
    main: {
      build: {
        target: 'node20',
        rollupOptions: {
          external: ['electron', 'electron/main', 'electron/common'],
          output: {
            format: 'cjs',
            entryFileNames: '[name].cjs',
            exports: 'auto',
            preserveModules: false
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
      build: {
        target: 'node20',
        rollupOptions: {
          external: ['electron', /^electron\/.*/],
          output: {
            format: 'cjs',
            entryFileNames: '[name].cjs',
            exports: 'auto'
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
  }
})
