import type { ExtendedWorld } from './ecs/world'
import { renderSystem } from './ecs/systems/render'
import { inputSystem } from './ecs/systems/input'
import { dialogSystem } from './ecs/systems/dialog'
import { uiSystem } from './ecs/systems/uiSystem'
import { cursorSystem } from './ecs/systems/cursor'

const systems = [dialogSystem, uiSystem, cursorSystem, inputSystem, renderSystem]

export function updateGame(world: ExtendedWorld, dt: number): void {
  for (const sys of systems) {
    sys(world, dt)
  }
}
