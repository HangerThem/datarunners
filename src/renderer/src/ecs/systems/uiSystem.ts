import { UIButton } from '../components/uiButton'
import { UICallback } from '../components/uiCallback'
import { defineQuery } from 'bitecs'
import { KeyCode, type ExtendedWorld } from '../world'
import { UIPosition } from '../components/uiPosition'

export const uiButtonQuery = defineQuery([UIButton])

export function uiSystem(world: ExtendedWorld): ExtendedWorld {
  for (const entity of uiButtonQuery(world)) {
    const callback = UICallback.onClick[entity]

    const mouseX = world.mousePosition.x
    const mouseY = world.mousePosition.y

    const x = UIPosition.x[entity]
    const y = UIPosition.y[entity]
    const width = UIPosition.width[entity]
    const height = UIPosition.height[entity]

    const isHovered = mouseX >= x && mouseX <= x + width && mouseY >= y && mouseY <= y + height

    if (isHovered) {
      world.cursor = 'pointer'
    }

    UIButton.hovered[entity] = isHovered ? 1 : 0

    const isPressed = isHovered && world.input.keysDown[KeyCode.MouseLeft]
    const clicked = isHovered && world.input.keysReleased[KeyCode.MouseLeft]

    UIButton.pressed[entity] = isPressed ? 1 : 0

    if (callback && clicked) {
      world.callbacks.invokeCallback(callback)
    }
  }

  return world
}
