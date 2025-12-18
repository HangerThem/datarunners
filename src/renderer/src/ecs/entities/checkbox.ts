import { addEntity, addComponent } from 'bitecs'
import { UIPosition } from '../components/ui/uiPosition'
import { UIRenderable } from '../components/ui/uiRenderable'
import { UICallback } from '../components/ui/uiCallback'
import { UITexture } from '../components/ui/uiTexture'
import { UICheckbox } from '../components/ui/uiCheckbox'
import { UIText } from '../components/ui/uiText'
import { UISelectable } from '../components/ui/uiSelectable'
import { CheckboxGroup } from '../components/checkboxGroup'
import { world } from '../world'
import { UICheckboxType } from '../../types/checkbox.types'

export function createCheckboxEntity(params: UICheckboxType): number {
  const entity = addEntity(world)

  addComponent(world, UIPosition, entity)
  addComponent(world, UIRenderable, entity)
  addComponent(world, UICallback, entity)
  addComponent(world, UITexture, entity)
  addComponent(world, UICheckbox, entity)
  addComponent(world, UISelectable, entity)
  addComponent(world, UIText, entity)

  UIPosition.x[entity] = params.x
  UIPosition.y[entity] = params.y

  UIRenderable.width[entity] = params.width
  UIRenderable.height[entity] = params.height
  UIRenderable.visible[entity] = 1

  UICallback.onClick[entity] = params.callbackId

  UITexture.textureId[entity] = params.textureId
  UITexture.textureSizeX[entity] = params.textureSizeX
  UITexture.textureSizeY[entity] = params.textureSizeY
  UITexture.textureOffsetX[entity] = params.textureOffsetX
  UITexture.textureOffsetY[entity] = params.textureOffsetY

  UICheckbox.checked[entity] = params.checked ? 1 : 0
  UISelectable.hovered[entity] = 0
  UISelectable.pressed[entity] = 0

  UIText.textId[entity] = params.labelId
  UIText.textSource[entity] = 0

  if (params.groupId !== undefined) {
    addComponent(world, CheckboxGroup, entity)
    CheckboxGroup.groupId[entity] = params.groupId
  }

  return entity
}
