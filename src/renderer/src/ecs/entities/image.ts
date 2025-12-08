import { addEntity, addComponent } from 'bitecs'
import { UIPosition } from '../components/uiPosition'
import type { ExtendedWorld } from '../world'
import { UITexture } from '../components/uiTexture'
import { UIRenderable } from '../components/uiRenderable'
import { Image } from '../components/image'

export function createImageEntity(
  world: ExtendedWorld,
  x: number,
  y: number,
  width: number,
  height: number,
  textureName: string,
  textureSizeX: number,
  textureSizeY: number
): number {
  const entity = addEntity(world)

  addComponent(world, UIPosition, entity)
  addComponent(world, UITexture, entity)
  addComponent(world, UIRenderable, entity)
  addComponent(world, Image, entity)

  UIPosition.x[entity] = x
  UIPosition.y[entity] = y

  UIRenderable.width[entity] = width
  UIRenderable.height[entity] = height

  UITexture.textureId[entity] = world.assets.getAssetId(textureName)!
  UITexture.textureSizeX[entity] = textureSizeX
  UITexture.textureSizeY[entity] = textureSizeY
  UITexture.textureOffsetX[entity] = 0
  UITexture.textureOffsetY[entity] = 0

  return entity
}
