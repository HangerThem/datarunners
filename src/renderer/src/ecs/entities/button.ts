import { addEntity, addComponent } from 'bitecs'
import { UIPosition } from '../components/ui/uiPosition'
import { UIRenderable } from '../components/ui/uiRenderable'
import { UICallback } from '../components/ui/uiCallback'
import { UIButton } from '../components/uiButton'
import { world } from '../world'
import { UITexture } from '../components/ui/uiTexture'
import { UIText } from '../components/ui/uiText'
import { UISelectable } from '../components/ui/uiSelectable'
import { UIButtonSchema, UIButtonType } from '../../types/button.types'

export function createButtonEntity(params: UIButtonType): number {
  const validatedButton = UIButtonSchema.safeParse(params)

  if (!validatedButton.success) {
    throw new Error(`Invalid UIButton parameters: ${validatedButton.error.message}`)
  }

  const entity = addEntity(world)

  addComponent(world, UIButton, entity)
  addComponent(world, UIRenderable, entity)
  addComponent(world, UIPosition, entity)
  addComponent(world, UICallback, entity)
  addComponent(world, UITexture, entity)
  addComponent(world, UIText, entity)
  addComponent(world, UISelectable, entity)

  UIPosition.x[entity] = validatedButton.data.x
  UIPosition.y[entity] = validatedButton.data.y

  UIRenderable.width[entity] = validatedButton.data.textureSizeX * validatedButton.data.scale
  UIRenderable.height[entity] = validatedButton.data.textureSizeY * validatedButton.data.scale
  UIRenderable.visible[entity] = 1
  UIText.textId[entity] = validatedButton.data.textId
  UIText.textSource[entity] = 1

  UICallback.onClick[entity] = validatedButton.data.callbackId

  UITexture.textureId[entity] = validatedButton.data.textureId
  UITexture.textureSizeX[entity] = validatedButton.data.textureSizeX
  UITexture.textureSizeY[entity] = validatedButton.data.textureSizeY
  UITexture.textureOffsetX[entity] = validatedButton.data.textureOffsetX
  UITexture.textureOffsetY[entity] = validatedButton.data.textureOffsetY

  UIButton.foreground[entity] = validatedButton.data.foregroundColor
  UIButton.foregroundHover[entity] = validatedButton.data.hoverForegroundColor!
  UIButton.foregroundPressed[entity] = validatedButton.data.pressedForegroundColor!

  UISelectable.hovered[entity] = 0
  UISelectable.pressed[entity] = 0

  return entity
}
