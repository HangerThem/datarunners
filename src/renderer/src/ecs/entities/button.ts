import { addEntity, addComponent } from 'bitecs'
import { UIPosition } from '../components/ui/uiPosition'
import { UIRenderable } from '../components/ui/uiRenderable'
import { UICallback } from '../components/ui/uiCallback'
import { UIButton } from '../components/ui/uiButton'
import { world } from '../world'
import { UITexture } from '../components/ui/uiTexture'
import { UIText } from '../components/ui/uiText'
import { UISelectable } from '../components/ui/uiSelectable'
import { UIButtonType } from '../../types/button.types'
import { UIColor } from '../components/ui/uiColor'

export function createButtonEntity(params: UIButtonType): number {
  const entity = addEntity(world)

  addComponent(world, UIPosition, entity)
  addComponent(world, UIRenderable, entity)
  addComponent(world, UIText, entity)
  addComponent(world, UIButton, entity)
  addComponent(world, UICallback, entity)
  addComponent(world, UISelectable, entity)

  UIPosition.x[entity] = params.x
  UIPosition.y[entity] = params.y

  UIRenderable.width[entity] = params.width
  UIRenderable.height[entity] = params.height
  UIRenderable.visible[entity] = 1

  UIText.textId[entity] = params.textId
  UIText.textSource[entity] = 0

  UIButton.foreground[entity] = params.foregroundColor
  UIButton.foregroundHover[entity] = params.hoverForegroundColor
  UIButton.foregroundPressed[entity] = params.pressedForegroundColor

  UICallback.onClick[entity] = params.callbackId

  UISelectable.hovered[entity] = 0
  UISelectable.pressed[entity] = 0

  if (params.textureId) {
    addComponent(world, UITexture, entity)
    UITexture.textureId[entity] = params.textureId
    UITexture.textureSizeX[entity] = params.textureSizeX
    UITexture.textureSizeY[entity] = params.textureSizeY
    UITexture.textureOffsetX[entity] = params.textureOffsetX
    UITexture.textureOffsetY[entity] = params.textureOffsetY
  } else {
    addComponent(world, UIColor, entity)
    UIColor.color[entity] = params.backgroundColor
  }

  return entity
}
