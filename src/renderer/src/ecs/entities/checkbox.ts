import { addEntity, addComponent } from 'bitecs'
import { UIPosition } from '../components/ui/uiPosition'
import { UIRenderable } from '../components/ui/uiRenderable'
import { UICallback } from '../components/ui/uiCallback'
import type { ExtendedWorld } from '../world'
import { UITexture } from '../components/ui/uiTexture'
import { UICheckbox } from '../components/ui/uiCheckbox'
import { UIText } from '../components/ui/uiText'
import { UISelectable } from '../components/ui/uiSelectable'

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
  callbackId: number,
  textId: number
): number {
  const entity = addEntity(world)

  addComponent(world, UICheckbox, entity)
  addComponent(world, UIRenderable, entity)
  addComponent(world, UIPosition, entity)
  addComponent(world, UICallback, entity)
  addComponent(world, UITexture, entity)
  addComponent(world, UISelectable, entity)

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

  UICheckbox.checked[entity] = checked ? 1 : 0

  UISelectable.hovered[entity] = 0
  UISelectable.pressed[entity] = 0

  UIText.textId[entity] = textId
  UIText.textSource[entity] = 1

  return entity
}
