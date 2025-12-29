import { defineQuery } from 'bitecs'
import type { ExtendedWorld } from '../world'
import { System } from './system'
import { UIPosition } from '../components/ui/uiPosition'
import { UIRenderable } from '../components/ui/uiRenderable'
import { isEditorMode, setSelectedEntityId } from '../../main'

export class EditorSystem implements System {
  private query = defineQuery([UIPosition])

  update(world: ExtendedWorld, dt: number): ExtendedWorld {
    if (!isEditorMode()) return world

    return this.updateEditor(world, dt)
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private updateEditor(world: ExtendedWorld, _dt: number): ExtendedWorld {
    const mouseX = world.mousePosition.x
    const mouseY = world.mousePosition.y

    for (const entity of this.query(world)) {
      if (world.input.keysDown['MouseLeft']) {
        const x = UIPosition.x[entity]
        const y = UIPosition.y[entity]
        const width = UIRenderable.width[entity]
        const height = UIRenderable.height[entity]

        if (mouseX >= x && mouseX <= x + width && mouseY >= y && mouseY <= y + height) {
          setSelectedEntityId(entity)
        }
      }
    }

    return world
  }
}
