import { contextBridge } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import path from 'path'

const api = {}

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
    contextBridge.exposeInMainWorld('assets', {
      resolve: (p: string) => path.join(process.resourcesPath, 'assets', p)
    })
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}
