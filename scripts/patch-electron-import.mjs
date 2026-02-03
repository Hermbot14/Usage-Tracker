import { readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'

async function patchFile(filePath, electronExports) {
  let content = await readFile(filePath, 'utf-8')

  // Replace the problematic electron require with the correct destructured form
  content = content.replace(
    /const electron = require\("electron"\);/g,
    `const { ${electronExports.join(', ')} } = require("electron");`
  )

  // Replace electron.XXX with XXX for each export
  for (const exp of electronExports) {
    const regex = new RegExp(`electron\\.${exp}`, 'g')
    content = content.replace(regex, exp)
  }

  await writeFile(filePath, content, 'utf-8')
}

const mainFile = join(process.cwd(), 'out', 'main', 'index.cjs')
const preloadFile = join(process.cwd(), 'out', 'preload', 'index.cjs')

// Patch main process with electron main exports
await patchFile(mainFile, ['app', 'BrowserWindow', 'shell', 'ipcMain', 'nativeTheme', 'Tray', 'Menu', 'MenuItem'])
console.log('✓ Main process electron imports patched')

// Patch preload with electron renderer exports
await patchFile(preloadFile, ['ipcRenderer', 'contextBridge'])
console.log('✓ Preload electron imports patched')
