type GameAsset = {
  name: string
  src: string
}

export interface SceneAssets {
  images: GameAsset[]
  fonts: GameAsset[]
  audio: GameAsset[]
  texts: GameAsset[]
}

export abstract class Scene {
  abstract load(): Promise<void>
  abstract update(dt: number): void
  abstract unload(): Promise<void>
}
