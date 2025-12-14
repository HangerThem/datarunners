import { UIButton } from '../components/uiButton'
import { UICallback } from '../components/uiCallback'
import { defineQuery } from 'bitecs'
import type { ExtendedWorld } from '../world'
import { UIPosition } from '../components/uiPosition'
import { UIRenderable } from '../components/uiRenderable'
import { System } from './system'
import { UICheckbox } from '../components/uiCheckbox'
import { getKeyId } from '../../utils/key'
import { UISelectable } from '../components/uiSelectable'
import { TextInput } from '../components/textInput'

export class UISystem implements System {
  private buttonQuery = defineQuery([UIButton])
  private checkboxQuery = defineQuery([UICheckbox])
  private textInputQuery = defineQuery([TextInput])

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  update(world: ExtendedWorld, _dt: number): ExtendedWorld {
    world = this.updateButtons(world)
    world = this.updateCheckboxes(world)
    world = this.updateTextInputs(world)
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

      UISelectable.hovered[entity] = isHovered ? 1 : 0

      const isPressed = isHovered && world.input.keysDown[getKeyId('MouseLeft')]
      const clicked = isHovered && world.input.keysReleased[getKeyId('MouseLeft')]

      UISelectable.pressed[entity] = isPressed ? 1 : 0

      if (callback && clicked) {
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

      UISelectable.hovered[entity] = isHovered ? 1 : 0

      const isPressed = isHovered && world.input.keysDown[getKeyId('MouseLeft')]
      const clicked = isHovered && world.input.keysReleased[getKeyId('MouseLeft')]

      UISelectable.pressed[entity] = isPressed ? 1 : 0

      if (callback && clicked) {
        UICheckbox.checked[entity] = UICheckbox.checked[entity] ? 0 : 1
        world.callbacks.invokeCallback(callback)
      }
    }

    return world
  }

  private updateTextInputs(world: ExtendedWorld): ExtendedWorld {
    for (const entity of this.textInputQuery(world)) {
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

      UISelectable.hovered[entity] = isHovered ? 1 : 0

      const isPressed = isHovered && world.input.keysDown[getKeyId('MouseLeft')]
      const clicked = isHovered && world.input.keysReleased[getKeyId('MouseLeft')]

      UISelectable.pressed[entity] = isPressed ? 1 : 0

      if (clicked) {
        TextInput.focused[entity] = 1
      }
    }

    return world
  }
}
