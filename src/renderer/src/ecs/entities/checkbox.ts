import { addEntity, addComponent } from 'bitecs'
import { UIPosition } from '../components/uiPosition'
import { UIRenderable } from '../components/uiRenderable'
import { UICallback } from '../components/uiCallback'
import type { ExtendedWorld } from '../world'
import { UITexture } from '../components/uiTexture'
import { UICheckbox } from '../components/uiCheckbox'

export function createCheckboxEntity(
  world: ExtendedWorld,
  textureName: string,
  x: number,
  y: number,
  scale: number,
  textureSizeX: number,
  textureSizeY: number,
  textureOffsetX: number,
  textureOffsetY: number,
  checked: boolean = false,
  callbackId: number
): number {
  const entity = addEntity(world)

  addComponent(world, UICheckbox, entity)
  addComponent(world, UIRenderable, entity)
  addComponent(world, UIPosition, entity)
  addComponent(world, UICallback, entity)
  addComponent(world, UITexture, entity)

  UIPosition.x[entity] = x
  UIPosition.y[entity] = y

  UIRenderable.width[entity] = textureSizeX * scale
  UIRenderable.height[entity] = textureSizeY * scale
  UIRenderable.visible[entity] = 1

  UICallback.onClick[entity] = callbackId

  UITexture.textureId[entity] = world.assets.getAssetId(textureName)!
  UITexture.textureSizeX[entity] = textureSizeX
  UITexture.textureSizeY[entity] = textureSizeY
  UITexture.textureOffsetX[entity] = textureOffsetX
  UITexture.textureOffsetY[entity] = textureOffsetY

  UICheckbox.hovered[entity] = 0
  UICheckbox.pressed[entity] = 0
  UICheckbox.checked[entity] = checked ? 1 : 0

  return entity
}
