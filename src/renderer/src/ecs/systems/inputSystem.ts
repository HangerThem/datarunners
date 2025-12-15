import type { ExtendedWorld } from '../world'
import { System } from './system'

export class InputSystem implements System {
  update(world: ExtendedWorld, dt: number): ExtendedWorld {
    return this.updateInput(world, dt)
  }

  private updateInput(world: ExtendedWorld, dt: number): ExtendedWorld {
    for (const key of world.input.activeKeys) {
      if (world.input.keysDown[key]) {
        world.input.holdTimes[key] += dt
      }

      world.input.keysPressed[key] = 0
      world.input.keysReleased[key] = 0
    }

    world.input.textInputBuffer = []

    return world
  }
}
