import { UICallback } from '../components/ui/uiCallback'
import { defineQuery, hasComponent } from 'bitecs'
import type { ExtendedWorld } from '../world'
import { UIPosition } from '../components/ui/uiPosition'
import { UIRenderable } from '../components/ui/uiRenderable'
import { System } from './system'
import { UICheckbox } from '../components/ui/uiCheckbox'
import { getKeyId } from '../../utils/key'
import { UISelectable } from '../components/ui/uiSelectable'
import { UITextInput } from '../components/ui/uiTextInput'
import { UIButton } from '../components/ui/uiButton'
import { CheckboxGroup } from '../components/checkboxGroup'
import { UIDropdown } from '../components/ui/uiDropdown'

export class UISystem implements System {
  private sellectableQuery = defineQuery([UIPosition, UISelectable])

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  update(world: ExtendedWorld, _dt: number): ExtendedWorld {
    world = this.updateSellectables(world)
    return world
  }

  private updateSellectables(world: ExtendedWorld): ExtendedWorld {
    for (const entity of this.sellectableQuery(world)) {
      const mouseX = world.mousePosition.x
      const mouseY = world.mousePosition.y

      const x = UIPosition.x[entity]
      const y = UIPosition.y[entity]

      const width = UIRenderable.width[entity]
      const height = UIRenderable.height[entity]

      const isHovered = mouseX >= x && mouseX <= x + width && mouseY >= y && mouseY <= y + height

      if (isHovered && hasComponent(world, UITextInput, entity)) {
        world.cursor = 'text'
      } else if (isHovered) {
        world.cursor = 'pointer'
      }

      if (
        (!isHovered && world.input.keysDown[getKeyId('MouseLeft')]) ||
        world.input.keysDown[getKeyId('Escape')]
      ) {
        if (hasComponent(world, UITextInput, entity)) {
          UITextInput.focused[entity] = 0
        } else if (hasComponent(world, UIDropdown, entity)) {
          UIDropdown.open[entity] = 0
        }
      }

      UISelectable.hovered[entity] = isHovered ? 1 : 0

      const isPressed = isHovered && world.input.keysDown[getKeyId('MouseLeft')]
      const clicked = isHovered && world.input.keysReleased[getKeyId('MouseLeft')]

      UISelectable.pressed[entity] = isPressed ? 1 : 0

      if (clicked) {
        if (hasComponent(world, UIButton, entity)) {
          const callback = UICallback.onClick[entity]
          if (callback) {
            world.callbacks.invokeCallback(callback)
          }
        } else if (hasComponent(world, UICheckbox, entity)) {
          if (hasComponent(world, CheckboxGroup, entity)) {
            const groupId = CheckboxGroup.groupId[entity]
            for (const otherEntity of this.sellectableQuery(world)) {
              if (
                otherEntity !== entity &&
                hasComponent(world, UICheckbox, otherEntity) &&
                hasComponent(world, CheckboxGroup, otherEntity) &&
                CheckboxGroup.groupId[otherEntity] === groupId
              ) {
                UICheckbox.checked[otherEntity] = 0
              }
            }
            UICheckbox.checked[entity] = 1
          } else {
            UICheckbox.checked[entity] = UICheckbox.checked[entity] ? 0 : 1
          }

          const callback = UICallback.onClick[entity]
          if (callback) {
            world.callbacks.invokeCallback(callback)
          }
        } else if (hasComponent(world, UITextInput, entity)) {
          UITextInput.focused[entity] = 1
        } else if (hasComponent(world, UIDropdown, entity)) {
          UIDropdown.open[entity] = UIDropdown.open[entity] ? 0 : 1
        }
      }
    }

    return world
  }
}
