import { addEntity, addComponent } from 'bitecs'
import { UIPosition } from '../components/ui/uiPosition'
import { UIRenderable } from '../components/ui/uiRenderable'
import { UICallback } from '../components/ui/uiCallback'
import { UIButton } from '../components/uiButton'
import type { ExtendedWorld } from '../world'
import { UITexture } from '../components/ui/uiTexture'
import { UIText } from '../components/ui/uiText'
import { UISelectable } from '../components/ui/uiSelectable'

export function createButtonEntity(
  world: ExtendedWorld,
  textName: string,
  x: number,
  y: number,
  scale: number,
  textureName: string,
  textureSizeX: number,
  textureSizeY: number,
  textureOffsetX: number,
  textureOffsetY: number,
  foregroundColor: number,
  hoverForegroundColor: number,
  pressedForegroundColor: number,
  callbackId: number
): number {
  const entity = addEntity(world)

  addComponent(world, UIButton, entity)
  addComponent(world, UIRenderable, entity)
  addComponent(world, UIPosition, entity)
  addComponent(world, UICallback, entity)
  addComponent(world, UITexture, entity)
  addComponent(world, UIText, entity)
  addComponent(world, UISelectable, entity)

  UIPosition.x[entity] = x
  UIPosition.y[entity] = y

  UIRenderable.width[entity] = textureSizeX * scale
  UIRenderable.height[entity] = textureSizeY * scale
  UIRenderable.visible[entity] = 1
  UIText.textId[entity] = world.assets.getAssetId(textName)!
  UIText.textSource[entity] = 1

  UICallback.onClick[entity] = callbackId

  UITexture.textureId[entity] = world.assets.getAssetId(textureName)!
  UITexture.textureSizeX[entity] = textureSizeX
  UITexture.textureSizeY[entity] = textureSizeY
  UITexture.textureOffsetX[entity] = textureOffsetX
  UITexture.textureOffsetY[entity] = textureOffsetY

  UIButton.foreground[entity] = foregroundColor
  UIButton.foregroundHover[entity] = hoverForegroundColor
  UIButton.foregroundPressed[entity] = pressedForegroundColor

  UISelectable.hovered[entity] = 0
  UISelectable.pressed[entity] = 0

  return entity
}
