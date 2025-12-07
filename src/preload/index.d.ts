import { ElectronAPI } from '@electron-toolkit/preload'

declare global {
  interface Window {
    electron: ElectronAPI
    api: unknown
    assets: {
      resolve: (assetPath: string) => Promise<string>
    }
  }
}
