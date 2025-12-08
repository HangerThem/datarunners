export abstract class Scene {
  abstract load(): Promise<void>
  abstract update(dt: number): void
  abstract unload(): Promise<void>
}
