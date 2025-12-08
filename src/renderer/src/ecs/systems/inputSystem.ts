import { InputResource, KEY_COUNT, world, type ExtendedWorld } from '../world'
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
    for (let i = 0; i < KEY_COUNT; i++) {
      if (this.input.keysDown[i]) {
        this.input.holdTimes[i] += dt
      }

      this.input.keysPressed[i] = 0
      this.input.keysReleased[i] = 0
    }

    return world
  }
}
