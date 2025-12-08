import { Scene } from './Scene'
import { world } from '../ecs/world'
import { RenderSystem } from '../ecs/systems/renderSystem'
import { System } from '../ecs/systems/system'
import { addComponent, addEntity, getAllEntities, removeEntity } from 'bitecs'
import { UIRenderable } from '../ecs/components/uiRenderable'
import { UIPosition } from '../ecs/components/uiPosition'
import { UIText } from '../ecs/components/uiText'
import { UIPureText } from '../ecs/components/uiPureText'

export class LoadingScene implements Scene {
  private systems: System[]

  constructor() {
    this.systems = [new RenderSystem()]
  }

  async load(): Promise<void> {
    const loading = addEntity(world)

    addComponent(world, UIRenderable, loading)
    addComponent(world, UIText, loading)
    addComponent(world, UIPureText, loading)
    addComponent(world, UIPosition, loading)

    UIText.textId[loading] = world.assets.addTextAsset('loading_text', 'Loading...')

    UIRenderable.visible[loading] = 1

    UIPosition.x[loading] = world.renderer.width / 2 - 100
    UIPosition.y[loading] = world.renderer.height / 2 - 25

    UIRenderable.width[loading] = 200
    UIRenderable.height[loading] = 50
  }

  update(dt: number): void {
    for (const sys of this.systems) {
      sys.update(world, dt)
    }
  }

  async unload(): Promise<void> {
    for (const entity of getAllEntities(world)) {
      removeEntity(world, entity)
    }
  }
}
