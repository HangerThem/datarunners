import { Howl, Howler } from 'howler'
import { AssetsManager } from './assetsManager'

export class AudioManager {
  private assetManager: AssetsManager

  constructor(_assetManager: AssetsManager) {
    this.assetManager = _assetManager
  }

  playSound(name: string, loop = false): void {
    const asset = this.assetManager.getAssetByName<Howl>(name)
    if (asset) {
      asset.loop(loop)
      asset.play()
    } else {
      console.warn(`Audio asset "${name}" not found or is not an audio.`)
    }
  }

  setGlobalVolume(volume: number): void {
    Howler.volume(volume)
  }

  stopAllSounds(): void {
    Howler.stop()
  }
}
