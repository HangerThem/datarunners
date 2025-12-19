import { addEntity, addComponent } from 'bitecs'
import { UIPosition } from '../components/ui/uiPosition'
import { UIRenderable } from '../components/ui/uiRenderable'
import { UIButton } from '../components/ui/uiButton'
import { world } from '../world'
import { UITexture } from '../components/ui/uiTexture'
import { UIText } from '../components/ui/uiText'
import { UISelectable } from '../components/ui/uiSelectable'
import { UIColor } from '../components/ui/uiColor'
import { UIDropdownType } from '../../types/dropdown.types'
import { UIDropdown } from '../components/ui/uiDropdown'
import { setDropdownOptions } from '../../utils/dropdown'
import { UIDropdownOption } from '../components/ui/uiDropdownOption'

export function createDropdownEntity(params: UIDropdownType): number {
  const entity = addEntity(world)

  addComponent(world, UIPosition, entity)
  addComponent(world, UIRenderable, entity)
  addComponent(world, UIText, entity)
  addComponent(world, UIDropdown, entity)
  addComponent(world, UISelectable, entity)

  UIPosition.x[entity] = params.x
  UIPosition.y[entity] = params.y

  UIRenderable.width[entity] = params.width
  UIRenderable.height[entity] = params.height
  UIRenderable.visible[entity] = 1

  UIText.textId[entity] = params.labelId
  UIText.textSource[entity] = 0

  UIButton.foreground[entity] = params.foregroundColor
  UIButton.foregroundHover[entity] = params.hoverForegroundColor
  UIButton.foregroundPressed[entity] = params.pressedForegroundColor

  UISelectable.hovered[entity] = 0
  UISelectable.pressed[entity] = 0

  UIDropdown.selectedIndex[entity] = params.selectedIndex
  UIDropdown.open[entity] = params.open ? 1 : 0

  if (params.textureId) {
    addComponent(world, UITexture, entity)
    UITexture.textureId[entity] = params.textureId
    UITexture.textureSizeX[entity] = params.textureSizeX
    UITexture.textureSizeY[entity] = params.textureSizeY
    UITexture.textureOffsetX[entity] = params.textureOffsetX
    UITexture.textureOffsetY[entity] = params.textureOffsetY
  } else {
    addComponent(world, UIColor, entity)
    UIColor.color[entity] = params.backgroundColor
  }

  for (let i = 0; i < params.options.length; i++) {
    const optionEntity = addEntity(world)

    addComponent(world, UISelectable, optionEntity)
    addComponent(world, UIRenderable, optionEntity)
    addComponent(world, UIPosition, optionEntity)
    addComponent(world, UIDropdownOption, optionEntity)

    UISelectable.hovered[optionEntity] = 0
    UISelectable.pressed[optionEntity] = 0

    UIRenderable.width[optionEntity] = params.width
    UIRenderable.height[optionEntity] = params.height
    UIRenderable.visible[optionEntity] = 0
    UIRenderable.sortOrder[optionEntity] = 1

    UIPosition.x[optionEntity] = params.x
    UIPosition.y[optionEntity] = params.y + (i + 1) * params.height

    UIDropdownOption.optionIndex[optionEntity] = i
    UIDropdownOption.parentDropdown[optionEntity] = entity
  }

  setDropdownOptions(entity, params.options)

  return entity
}
