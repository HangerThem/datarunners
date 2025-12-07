import type { ExtendedWorld } from '../world'

export function cursorSystem(world: ExtendedWorld): ExtendedWorld {
  document.body.style.cursor = world.cursor || 'default'
  world.cursor = 'default'

  return world
}
