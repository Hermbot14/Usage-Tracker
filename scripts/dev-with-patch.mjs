import { spawn } from 'node:child_process'
import { watch } from 'node:fs/promises'
import { join } from 'node:path'
import { readFile, writeFile } from 'node:fs/promises'

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

async function patch() {
  await patchFile(mainFile, ['app', 'BrowserWindow', 'shell', 'ipcMain', 'nativeTheme', 'Tray', 'Menu', 'MenuItem'])
  await patchFile(preloadFile, ['ipcRenderer', 'contextBridge'])
  console.log('✓ Electron imports patched')
}

// Initial patch
await patch()

// Watch for changes and re-patch
const ac = new AbortController()
try {
  const watcher = watch(join(process.cwd(), 'out'), { signal: ac.signal })
  for await (const event of watcher) {
    if (event.filename.endsWith('index.cjs')) {
      await patch()
    }
  }
} catch (err) {
  if (err.name !== 'AbortError') throw err
}

// Then run electron
const electron = spawn('npx', ['electron', mainFile], { stdio: 'inherit' })
electron.on('exit', () => ac.abort())
