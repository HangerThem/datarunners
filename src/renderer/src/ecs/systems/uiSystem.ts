import { UIButton } from '../components/uiButton'
import { UICallback } from '../components/uiCallback'
import { defineQuery } from 'bitecs'
import { KeyCode, type ExtendedWorld } from '../world'
import { UIPosition } from '../components/uiPosition'
import { UIRenderable } from '../components/uiRenderable'
import { System } from './system'
import { UICheckbox } from '../components/uiCheckbox'

export class UISystem implements System {
  private buttonQuery = defineQuery([UIButton])
  private checkboxQuery = defineQuery([UICheckbox])

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  update(world: ExtendedWorld, _dt: number): ExtendedWorld {
    world = this.updateButtons(world)
    world = this.updateCheckboxes(world)
    return world
  }

  private updateButtons(world: ExtendedWorld): ExtendedWorld {
    for (const entity of this.buttonQuery(world)) {
      const callback = UICallback.onClick[entity]

      const mouseX = world.mousePosition.x
      const mouseY = world.mousePosition.y

      const x = UIPosition.x[entity]
      const y = UIPosition.y[entity]

      const width = UIRenderable.width[entity]
      const height = UIRenderable.height[entity]

      const isHovered = mouseX >= x && mouseX <= x + width && mouseY >= y && mouseY <= y + height

      if (isHovered) {
        world.cursor = 'pointer'
      }

      UIButton.hovered[entity] = isHovered ? 1 : 0

      const isPressed = isHovered && world.input.keysDown[KeyCode.MouseLeft]
      const clicked = isHovered && world.input.keysReleased[KeyCode.MouseLeft]

      UIButton.pressed[entity] = isPressed ? 1 : 0

      if (callback && clicked) {
        console.log('Button clicked, invoking callback.')
        world.callbacks.invokeCallback(callback)
      }
    }

    return world
  }

  private updateCheckboxes(world: ExtendedWorld): ExtendedWorld {
    for (const entity of this.checkboxQuery(world)) {
      const callback = UICallback.onClick[entity]

      const mouseX = world.mousePosition.x
      const mouseY = world.mousePosition.y

      const x = UIPosition.x[entity]
      const y = UIPosition.y[entity]

      const width = UIRenderable.width[entity]
      const height = UIRenderable.height[entity]

      const isHovered = mouseX >= x && mouseX <= x + width && mouseY >= y && mouseY <= y + height

      if (isHovered) {
        world.cursor = 'pointer'
      }

      UICheckbox.hovered[entity] = isHovered ? 1 : 0

      const isPressed = isHovered && world.input.keysDown[KeyCode.MouseLeft]
      const clicked = isHovered && world.input.keysReleased[KeyCode.MouseLeft]

      UICheckbox.pressed[entity] = isPressed ? 1 : 0

      if (callback && clicked) {
        console.log('Checkbox clicked, toggling state.')
        UICheckbox.checked[entity] = UICheckbox.checked[entity] ? 0 : 1
        world.callbacks.invokeCallback(callback)
      }
    }

    return world
  }
}
