import { Howl } from 'howler'
import { asset } from '../utils/assets'
import { SceneAssets } from '../scenes/Scene'

interface Asset {
  dataType: 'image' | 'audio' | 'text'
  data: HTMLImageElement | Howl | string
}

export class AssetsManager {
  private assets: Map<string, Asset>
  private usage: Map<string, number> = new Map()

  constructor() {
    this.assets = new Map()
  }

  async loadSceneAssets(assets: SceneAssets): Promise<void> {
    const required = new Set([
      ...assets.images.map((a) => a.name),
      ...assets.audio.map((a) => a.name),
      ...assets.texts.map((a) => a.name),
      ...assets.fonts.map((a) => a.name)
    ])

    required.forEach((name) => {
      const count = this.usage.get(name) ?? 0
      this.usage.set(name, count + 1)
    })

    for (const name of this.assets.keys()) {
      if (!required.has(name)) {
        const count = (this.usage.get(name) ?? 1) - 1
        if (count <= 0) {
          this.unloadAsset(name)
          this.usage.delete(name)
        } else {
          this.usage.set(name, count)
        }
      }
    }

    await this.loadImages(assets.images.filter((a) => !this.assets.has(a.name)))

    await this.loadFonts(assets.fonts.filter((a) => !this.assets.has(a.name)))

    await this.loadAudios(assets.audio.filter((a) => !this.assets.has(a.name)))

    await this.loadTexts(assets.texts.filter((a) => !this.assets.has(a.name)))
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

  getAssetId(name: string): number {
    const keys = Array.from(this.assets.keys())
    const index = keys.indexOf(name)
    return index !== -1 ? index : -1
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
    const asset = this.assets.get(name)
    if (!asset) return

    if (asset.dataType === 'audio') {
      ;(asset.data as Howl).unload()
    }

    this.assets.delete(name)
  }

  isValidAsset(id: number, type: 'image' | 'audio' | 'text'): boolean {
    const keys = Array.from(this.assets.keys())
    if (id >= 0 && id < keys.length) {
      const name = keys[id]
      const asset = this.assets.get(name)
      return asset?.dataType === type
    }
    return false
  }

  unloadAll(): void {
    this.assets.clear()
  }
}
