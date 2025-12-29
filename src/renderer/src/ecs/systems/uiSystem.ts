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
import { UIDropdownOption } from '../components/ui/uiDropdownOption'
import { UIRange } from '../components/ui/uiRange'
import { isEditorMode } from '../../main'

export class UISystem implements System {
  private sellectableQuery = defineQuery([UIPosition, UISelectable])

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  update(world: ExtendedWorld, _dt: number): ExtendedWorld {
    if (isEditorMode()) return world

    world = this.updateSellectables(world)
    return world
  }

  private updateSellectables(world: ExtendedWorld): ExtendedWorld {
    for (const entity of this.sellectableQuery(world).sort(
      (a, b) => UIRenderable.sortOrder[b] - UIRenderable.sortOrder[a]
    )) {
      if (UIRenderable.visible[entity] === 0) {
        continue
      }

      const isHovered = this.isHovered(world, entity)

      if (isHovered) {
        if (hasComponent(world, UITextInput, entity)) {
          world.cursor = 'text'
        } else {
          world.cursor = 'pointer'
        }

        break
      }
    }

    for (const entity of this.sellectableQuery(world).sort(
      (a, b) => UIRenderable.sortOrder[b] - UIRenderable.sortOrder[a]
    )) {
      if (hasComponent(world, UIDropdownOption, entity)) {
        const parent = UIDropdownOption.parentDropdown[entity]
        UIRenderable.visible[entity] = UIDropdown.open[parent]
      }

      if (UIRenderable.visible[entity] === 0) {
        continue
      }

      const isHovered = this.isHovered(world, entity)

      UISelectable.hovered[entity] = isHovered ? 1 : 0

      const isPressed = isHovered && world.input.keysDown[getKeyId('MouseLeft')]
      const clicked = isHovered && world.input.keysReleased[getKeyId('MouseLeft')]

      UISelectable.pressed[entity] = isPressed ? 1 : 0

      if (isPressed && hasComponent(world, UIRange, entity)) {
        const mouseX = world.mousePosition.x
        const x = UIPosition.x[entity]
        const width = UIRenderable.width[entity]

        const ratio = Math.min(Math.max((mouseX - x) / width, 0), 1)
        const min = UIRange.min[entity]
        const max = UIRange.max[entity]
        const step = UIRange.step[entity]

        let value = min + ratio * (max - min)
        value = Math.round(value / step) * step

        UIRange.value[entity] = value

        const callback = UICallback.onClick[entity]
        if (callback) {
          world.callbacks.invokeCallback(callback, entity)
        }

        continue
      }

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
          switch (UIDropdown.open[entity]) {
            case 0:
              UIDropdown.open[entity] = 1
              break
            case 1:
              UIDropdown.open[entity] = 0
              break
          }
        } else if (hasComponent(world, UIDropdownOption, entity)) {
          const parentDropdown = UIDropdownOption.parentDropdown[entity]
          const optionIndex = UIDropdownOption.optionIndex[entity]
          UIDropdown.selectedIndex[parentDropdown] = optionIndex
          UIDropdown.open[parentDropdown] = 0
        }

        break
      }

      if (
        (!isHovered &&
          !this.isDropdownChildHovered(world, entity) &&
          world.input.keysDown[getKeyId('MouseLeft')]) ||
        world.input.keysDown[getKeyId('Escape')]
      ) {
        if (hasComponent(world, UITextInput, entity)) {
          UITextInput.focused[entity] = 0
        } else if (hasComponent(world, UIDropdown, entity)) {
          UIDropdown.open[entity] = 0
        }
      }
    }

    return world
  }

  private isDropdownChildHovered(world: ExtendedWorld, entity: number): boolean {
    if (!hasComponent(world, UIDropdown, entity)) {
      return false
    }

    for (const optionEntity of this.sellectableQuery(world)) {
      if (
        hasComponent(world, UIDropdownOption, optionEntity) &&
        UIDropdownOption.parentDropdown[optionEntity] === entity &&
        UIRenderable.visible[optionEntity] === 1
      ) {
        if (this.isHovered(world, optionEntity)) {
          return true
        }
      }
    }

    return false
  }

  private isHovered(world: ExtendedWorld, entity: number): boolean {
    const mouseX = world.mousePosition.x
    const mouseY = world.mousePosition.y

    const x = UIPosition.x[entity]
    const y = UIPosition.y[entity]

    const width = UIRenderable.width[entity]
    const height = UIRenderable.height[entity]

    return mouseX >= x && mouseX <= x + width && mouseY >= y && mouseY <= y + height
  }
}
