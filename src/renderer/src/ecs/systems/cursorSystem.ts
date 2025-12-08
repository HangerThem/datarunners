import { System } from './system'
import type { ExtendedWorld } from '../world'

export class CursorSystem implements System {
  update(world: ExtendedWorld, dt: number): ExtendedWorld {
    return this.updateCursor(world, dt)
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private updateCursor(world: ExtendedWorld, _dt: number): ExtendedWorld {
    document.body.style.cursor = world.cursor || 'default'
    world.cursor = 'default'

    return world
  }
}
