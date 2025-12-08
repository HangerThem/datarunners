import type { ExtendedWorld } from '../world'

export abstract class System {
  abstract update(world: ExtendedWorld, dt: number): ExtendedWorld
}
