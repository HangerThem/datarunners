import { KEY_COUNT, type ExtendedWorld } from '../world'

export function inputSystem(world: ExtendedWorld, dt: number): ExtendedWorld {
  const input = world.input

  for (let i = 0; i < KEY_COUNT; i++) {
    if (input.keysDown[i]) {
      input.holdTimes[i] += dt
    }

    input.keysPressed[i] = 0
    input.keysReleased[i] = 0
  }

  return world
}
