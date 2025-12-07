import { addEntity, addComponent } from 'bitecs'
import { UIPosition } from '../components/uiPosition'
import { UIRenderable } from '../components/uiRenderable'
import { UICallback } from '../components/uiCallback'
import { UIButton } from '../components/uiButton'
import type { ExtendedWorld } from '../world'

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

  UIPosition.x[entity] = x
  UIPosition.y[entity] = y
  UIPosition.width[entity] = textureSizeX * scale
  UIPosition.height[entity] = textureSizeY * scale

  UIRenderable.visible[entity] = 1

  UICallback.onClick[entity] = callbackId

  UIButton.textureId[entity] = world.assets.getAssetId(textureName)!
  UIButton.textureSizeX[entity] = textureSizeX
  UIButton.textureSizeY[entity] = textureSizeY
  UIButton.textureOffsetX[entity] = textureOffsetX
  UIButton.textureOffsetY[entity] = textureOffsetY
  UIButton.foreground[entity] = foregroundColor
  UIButton.foregroundHover[entity] = hoverForegroundColor
  UIButton.foregroundPressed[entity] = pressedForegroundColor
  UIButton.hovered[entity] = 0
  UIButton.pressed[entity] = 0
  UIRenderable.textId[entity] = world.assets.getAssetId(textName)!

  return entity
}
