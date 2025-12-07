import { app, shell, BrowserWindow, ipcMain, protocol } from 'electron'
import { join, resolve, extname, normalize } from 'path'
import { existsSync, readFileSync } from 'fs'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'

const scheme = 'game'
protocol.registerSchemesAsPrivileged([
  {
    scheme,
    privileges: { standard: true, secure: true, supportFetchAPI: true }
  }
])

function createWindow(): void {
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

app.whenReady().then(() => {
  electronApp.setAppUserModelId('com.electron')

  if (!is.dev) {
    protocol.handle(scheme, (request) => {
      try {
        const url = new URL(request.url)
        const urlPath = decodeURIComponent(url.pathname).replace(/^\//, '')

        const basePath = resolve(join(__dirname, '../renderer'))
        const assetsBase = resolve(join(basePath, 'assets'))

        const filePath = resolve(join(assetsBase, normalize(urlPath)))

        if (!filePath.startsWith(assetsBase)) {
          console.error(`[Protocol] Forbidden path: ${filePath}`)
          return new Response('Forbidden', { status: 403 })
        }

        if (!existsSync(filePath)) {
          console.error(`[Protocol] Not found: ${filePath} (from ${request.url})`)
          return new Response('Not Found', { status: 404 })
        }

        const data = readFileSync(filePath)
        const ext = extname(filePath).toLowerCase()

        const mimeTypes: Record<string, string> = {
          '.png': 'image/png',
          '.jpg': 'image/jpeg',
          '.jpeg': 'image/jpeg',
          '.gif': 'image/gif',
          '.svg': 'image/svg+xml',
          '.json': 'application/json',
          '.mp3': 'audio/mpeg',
          '.ogg': 'audio/ogg',
          '.wav': 'audio/wav',
          '.webm': 'video/webm',
          '.mp4': 'video/mp4',
          '.ttf': 'font/ttf',
          '.otf': 'font/otf',
          '.woff': 'font/woff',
          '.woff2': 'font/woff2'
        }

        return new Response(data, {
          headers: { 'content-type': mimeTypes[ext] || 'application/octet-stream' }
        })
      } catch (error) {
        console.error(`[Protocol] Error loading asset: ${request.url}`, error)
        return new Response('Not Found', { status: 404 })
      }
    })
  }

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  ipcMain.on('ping', () => console.log('pong'))

  createWindow()

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
