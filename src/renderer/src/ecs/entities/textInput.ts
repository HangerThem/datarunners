import { addComponent, addEntity } from 'bitecs'
import { UITextInputType } from '../../types/textInput.types'
import { world } from '../world'
import { UIText } from '../components/ui/uiText'
import { UIPosition } from '../components/ui/uiPosition'
import { UIRenderable } from '../components/ui/uiRenderable'
import { UISelectable } from '../components/ui/uiSelectable'
import { UITextInput } from '../components/ui/uiTextInput'
import { UIFont } from '../components/ui/uiFont'
import { allocString } from '../../utils/stringAllocator'

export function createTextInputEntity(params: UITextInputType): number {
  const inputEntity = addEntity(world)

  addComponent(world, UIText, inputEntity)
  addComponent(world, UIPosition, inputEntity)
  addComponent(world, UIRenderable, inputEntity)
  addComponent(world, UISelectable, inputEntity)
  addComponent(world, UITextInput, inputEntity)
  addComponent(world, UIFont, inputEntity)

  UIPosition.x[inputEntity] = params.x
  UIPosition.y[inputEntity] = params.y
  UIRenderable.width[inputEntity] = params.width
  UIRenderable.height[inputEntity] = params.height
  UIRenderable.visible[inputEntity] = 1
  UIText.textId[inputEntity] = params.labelId
  UIText.textSource[inputEntity] = 0
  UITextInput.maxLength[inputEntity] = params.maxLength
  UITextInput.numeric[inputEntity] = params.numeric ? 1 : 0
  UITextInput.cursor[inputEntity] = world.assets.getAssetById<string>(params.textId)!.length
  UITextInput.textId[inputEntity] = allocString(params.text)
  UIFont.fontSize[inputEntity] = params.fontSize
  UIFont.fontFamilyId[inputEntity] = params.fontFamilyId
  UIFont.color[inputEntity] = params.color

  return inputEntity
}
