import { Howl } from 'howler'
import { asset } from '../utils/assets'

interface Asset {
  dataType: 'image' | 'audio' | 'text'
  data: HTMLImageElement | Howl | string
}

export class AssetsManager {
  private assets: Map<string, Asset>
  constructor() {
    this.assets = new Map()
  }

  async loadImage(name: string, src: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.src = asset(src, 'image')
      img.onload = () => {
        this.assets.set(name, { dataType: 'image', data: img })
        resolve()
      }
      img.onerror = (err) => {
        console.error(`Failed to load image ${name}:`, err)
        reject(err)
      }
    })
  }

  async loadAudio(name: string, src: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const audioUrl = asset(src, 'audio')
      const sound = new Howl({
        src: [audioUrl],
        onload: () => {
          this.assets.set(name, { dataType: 'audio', data: sound })
          resolve()
        },
        onloaderror: (_id, err) => reject(err)
      })
    })
  }

  async loadImages(images: { name: string; src: string }[]): Promise<void> {
    const promises = images.map((image) => this.loadImage(image.name, image.src))
    await Promise.all(promises)
  }

  async loadAudios(audios: { name: string; src: string }[]): Promise<void> {
    const promises = audios.map((audio) => this.loadAudio(audio.name, audio.src))
    await Promise.all(promises)
  }

  async loadText(name: string, src: string): Promise<void> {
    return fetch(asset(src, 'text'))
      .then((response) => response.json())
      .then((text) => {
        this.assets.set(name, { dataType: 'text', data: text })
      })
  }

  async loadTexts(texts: { name: string; src: string }[]): Promise<void> {
    const promises = texts.map((text) => this.loadText(text.name, text.src))
    await Promise.all(promises)
  }

  addTextAsset(name: string, text: string): number {
    this.assets.set(name, { dataType: 'text', data: text })
    return this.getAssetId(name)!
  }

  async loadFont(name: string, src: string): Promise<void> {
    const font = new FontFace(name, `url(${asset(src, 'font')})`)

    await font.load()
    this.addTextAsset(name, name)
    document.fonts.add(font)
  }

  async loadFonts(fonts: { name: string; src: string }[]): Promise<void> {
    const promises = fonts.map((font) => this.loadFont(font.name, font.src))
    await Promise.all(promises)
  }

  getAssetByName<T>(name: string): T | undefined {
    const asset = this.assets.get(name)
    if (asset) {
      return asset.data as T
    }
    return undefined
  }

  getAssetId(name: string): number | undefined {
    const keys = Array.from(this.assets.keys())
    const index = keys.indexOf(name)
    return index !== -1 ? index : undefined
  }

  getAssetById<T>(id: number): T | undefined {
    const keys = Array.from(this.assets.keys())
    if (id >= 0 && id < keys.length) {
      const name = keys[id]
      const asset = this.assets.get(name)
      if (asset) {
        return asset.data as T
      }
    }
    return undefined
  }

  getAssetKeyById(id: number): string | undefined {
    const keys = Array.from(this.assets.keys())
    return id >= 0 && id < keys.length ? keys[id] : undefined
  }

  unloadAsset(name: string): void {
    this.assets.delete(name)
  }

  unloadAll(): void {
    this.assets.clear()
  }
}
