import { addEntity, addComponent } from 'bitecs'
import { Dialog, DialogText } from '../components/dialog'
import { UIPosition } from '../components/uiPosition'
import type { ExtendedWorld } from '../world'

export function createDialogEntity(
  world: ExtendedWorld,
  textName: string,
  x: number,
  y: number,
  width: number,
  height: number
): number {
  const entity = addEntity(world)

  addComponent(world, Dialog, entity)
  addComponent(world, DialogText, entity)
  addComponent(world, UIPosition, entity)

  DialogText.text[entity] = world.assets.getAssetId(textName)!
  UIPosition.x[entity] = x
  UIPosition.y[entity] = y
  UIPosition.width[entity] = width
  UIPosition.height[entity] = height
  Dialog.active[entity] = 0
  Dialog.currentLine[entity] = 0
  Dialog.totalLines[entity] = world.assets.getAssetById<string[]>(DialogText.text[entity])!.length
  Dialog.textId[entity] = DialogText.text[entity]

  return entity
}
