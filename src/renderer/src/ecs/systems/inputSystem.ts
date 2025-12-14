import { InputResource, world, type ExtendedWorld } from '../world'
import { System } from './system'

export class InputSystem implements System {
  private input: InputResource

  constructor() {
    this.input = world.input
  }

  update(world: ExtendedWorld, dt: number): ExtendedWorld {
    return this.updateInput(world, dt)
  }

  private updateInput(world: ExtendedWorld, dt: number): ExtendedWorld {
    for (const key of this.input.activeKeys) {
      if (this.input.keysDown[key]) {
        this.input.holdTimes[key] += dt
      }

      this.input.keysPressed[key] = 0
      this.input.keysReleased[key] = 0
    }

    this.input.activeKeys.clear()

    return world
  }
}
