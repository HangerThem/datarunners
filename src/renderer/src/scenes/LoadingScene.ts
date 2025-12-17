import { Scene, SceneAssets } from './Scene'
import { world } from '../ecs/world'
import { RenderSystem } from '../ecs/systems/renderSystem'
import { System } from '../ecs/systems/system'
import { addComponent, addEntity } from 'bitecs'
import { UIRenderable } from '../ecs/components/ui/uiRenderable'
import { UIPosition } from '../ecs/components/ui/uiPosition'
import { UITexture } from '../ecs/components/ui/uiTexture'
import { Image } from '../ecs/components/image'

export class LoadingScene implements Scene {
  private systems: System[]
  private assets: SceneAssets = {
    images: [
      {
        name: 'splash',
        src: 'splash.png'
      }
    ],
    fonts: [],
    audio: [],
    texts: []
  }

  constructor() {
    this.systems = [new RenderSystem()]
  }

  async load(): Promise<void> {
    await world.assets.loadSceneAssets(this.assets)

    const loading = addEntity(world)

    addComponent(world, UIRenderable, loading)
    addComponent(world, UIPosition, loading)
    addComponent(world, UITexture, loading)
    addComponent(world, Image, loading)

    UIRenderable.visible[loading] = 1

    UIPosition.x[loading] = world.renderer.width / 2 - 512
    UIPosition.y[loading] = world.renderer.height / 2 - 256

    UIRenderable.width[loading] = 1024
    UIRenderable.height[loading] = 512

    UITexture.textureId[loading] = world.assets.getAssetId('splash')!
    UITexture.textureSizeX[loading] = 1024
    UITexture.textureSizeY[loading] = 512
  }

  update(dt: number): void {
    for (const sys of this.systems) {
      sys.update(world, dt)
    }
  }

  async unload(): Promise<void> {
    world.reset()
  }
}
