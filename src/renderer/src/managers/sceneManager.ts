import { Scene } from '../scenes/Scene'

export class SceneManager {
  private currentScene: string = ''
  private scenes: Map<string, Scene> = new Map()

  registerScene(name: string, scene: Scene): void {
    this.scenes.set(name, scene)
  }

  async loadScene(name: string): Promise<void> {
    if (this.currentScene) {
      const current = this.scenes.get(this.currentScene)
      if (current) {
        await current.unload()
      }
    }

    const scene = this.scenes.get(name)
    if (scene) {
      await scene.load()
      this.currentScene = name
    } else {
      throw new Error(`Scene ${name} not found`)
    }
  }

  getCurrentScene(): Scene | null {
    if (this.currentScene) {
      return this.scenes.get(this.currentScene) || null
    }
    return null
  }
}
