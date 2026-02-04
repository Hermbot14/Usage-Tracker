import { readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'

async function patchFile(filePath, electronExports, electronModule = 'electron') {
  let content = await readFile(filePath, 'utf-8')

  // Replace ONLY the FIRST occurrence of electron require with destructured form
  // Subsequent requires should be removed entirely to avoid duplicates
  let firstRequireDone = false
  content = content.replace(
    /const (?:electron\$?\w*) = require\("electron"\);/g,
    () => {
      if (!firstRequireDone) {
        firstRequireDone = true
        return `const { ${electronExports.join(', ')} } = require("${electronModule}");`
      }
      return '' // Remove subsequent requires
    }
  )

  // Remove orphaned destructuring lines that reference undefined electron variables
  // These are lines like: const { app } = electron; where 'electron' is no longer defined
  // because we removed the 'const electron = require("electron")' line above it
  content = content.replace(
    /const \{[^}]*\} = (?:electron\$?\w*);\n?/g,
    ''
  )

  // Replace (?:electron\$?\w*).XXX with XXX for each export
  for (const exp of electronExports) {
    // Match electron.XXX, electron$2.XXX, etc.
    const regex = new RegExp(`(?:electron\\$?\\w*)\\.${exp}`, 'g')
    content = content.replace(regex, exp)
  }

  await writeFile(filePath, content, 'utf-8')
}

const mainFile = join(process.cwd(), 'out', 'main', 'index.cjs')
const preloadFile = join(process.cwd(), 'out', 'preload', 'index.cjs')

// Patch main process with electron main exports
await patchFile(mainFile, ['app', 'BrowserWindow', 'shell', 'ipcMain', 'nativeTheme', 'Tray', 'Menu', 'MenuItem', 'nativeImage'], 'electron')
console.log('✓ Main process electron imports patched')

// Patch preload with electron renderer exports
await patchFile(preloadFile, ['ipcRenderer', 'contextBridge'])
console.log('✓ Preload electron imports patched')
