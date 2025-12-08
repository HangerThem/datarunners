import { addEntity, addComponent } from 'bitecs'
import { Dialog, DialogText } from '../components/dialog'
import { UIPosition } from '../components/uiPosition'
import type { ExtendedWorld } from '../world'
import { UITexture } from '../components/uiTexture'
import { UIRenderable } from '../components/uiRenderable'

export function createDialogEntity(
  world: ExtendedWorld,
  textName: string,
  width: number,
  height: number,
  textureName: string,
  textureSizeX: number,
  textureSizeY: number,
  textureOffsetX: number,
  textureOffsetY: number
): number {
  const entity = addEntity(world)

  addComponent(world, Dialog, entity)
  addComponent(world, DialogText, entity)
  addComponent(world, UIPosition, entity)
  addComponent(world, UITexture, entity)
  addComponent(world, UIRenderable, entity)

  DialogText.text[entity] = world.assets.getAssetId(textName)!

  UIRenderable.width[entity] = width
  UIRenderable.height[entity] = height

  UITexture.textureId[entity] = world.assets.getAssetId(textureName)!
  UITexture.textureSizeX[entity] = textureSizeX
  UITexture.textureSizeY[entity] = textureSizeY
  UITexture.textureOffsetX[entity] = textureOffsetX
  UITexture.textureOffsetY[entity] = textureOffsetY

  Dialog.active[entity] = 0
  Dialog.currentLine[entity] = 0
  Dialog.totalLines[entity] = world.assets.getAssetById<string[]>(DialogText.text[entity])!.length
  Dialog.textId[entity] = DialogText.text[entity]

  return entity
}
