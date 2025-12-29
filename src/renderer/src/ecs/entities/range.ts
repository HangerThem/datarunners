import { addEntity, addComponent } from 'bitecs'
import { UIPosition } from '../components/ui/uiPosition'
import { UIRenderable } from '../components/ui/uiRenderable'
import { UICallback } from '../components/ui/uiCallback'
import { UIText } from '../components/ui/uiText'
import { UISelectable } from '../components/ui/uiSelectable'
import { world } from '../world'
import { UIRange } from '../components/ui/uiRange'
import { UIRangeType } from '../../types/range.types'

export function createRangeEntity(params: UIRangeType): number {
  const entity = addEntity(world)

  addComponent(world, UIPosition, entity)
  addComponent(world, UIRenderable, entity)
  addComponent(world, UICallback, entity)
  addComponent(world, UISelectable, entity)
  addComponent(world, UIText, entity)
  addComponent(world, UIRange, entity)

  UIPosition.x[entity] = params.x
  UIPosition.y[entity] = params.y

  UIRenderable.width[entity] = params.width
  UIRenderable.height[entity] = params.height
  UIRenderable.visible[entity] = 1

  UICallback.onClick[entity] = params.callbackId

  UISelectable.hovered[entity] = 0
  UISelectable.pressed[entity] = 0

  UIText.textId[entity] = params.labelId
  UIText.textSource[entity] = 0

  UIRange.value[entity] = params.value
  UIRange.min[entity] = params.min
  UIRange.max[entity] = params.max
  UIRange.step[entity] = params.step

  return entity
}
