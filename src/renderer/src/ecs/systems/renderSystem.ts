import { defineQuery, hasComponent } from 'bitecs'
import { UIPosition } from '../components/ui/uiPosition'
import { world, type ExtendedWorld } from '../world'
import { Dialog, DialogText } from '../components/dialog'
import { getCurrentLineText } from '../../utils/text'
import { UIButton } from '../components/ui/uiButton'
import { UIRenderable } from '../components/ui/uiRenderable'
import { blendColors, colorToCss, hexColor } from '../../utils/colors'
import { wrapText } from '../../utils/text'
import { UITexture } from '../components/ui/uiTexture'
import { System } from './system'
import { UIText } from '../components/ui/uiText'
import { UIPureText } from '../components/ui/uiPureText'
import { UICheckbox } from '../components/ui/uiCheckbox'
import { Image } from '../components/image'
import { getString } from '../../utils/stringAllocator'
import { UIColor } from '../components/ui/uiColor'
import { UISelectable } from '../components/ui/uiSelectable'
import { UITextInput } from '../components/ui/uiTextInput'
import { UIFont } from '../components/ui/uiFont'
import { UIDropdown } from '../components/ui/uiDropdown'
import { getDropdownOptions } from '../../utils/dropdown'
import { UIDropdownOption } from '../components/ui/uiDropdownOption'

export class RenderSystem implements System {
  private ctx: CanvasRenderingContext2D
  private textQuery = defineQuery([UIPosition, UIPureText])
  private buttonQuery = defineQuery([UIPosition, UIButton])
  private dialogQuery = defineQuery([UIPosition, Dialog])
  private checkboxQuery = defineQuery([UIPosition, UICheckbox])
  private imageQuery = defineQuery([UIPosition, Image])
  private textInputQuery = defineQuery([UIPosition, UITextInput])
  private dropdownQuery = defineQuery([UIPosition, UIDropdown])
  private dropdownOptionQuery = defineQuery([UIPosition, UIDropdownOption])

  constructor() {
    this.ctx = world.renderer.ctx
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  update(world: ExtendedWorld, _dt: number): ExtendedWorld {
    this.ctx.fillStyle = 'black'
    this.ctx.fillRect(0, 0, world.renderer.width, world.renderer.height)
    world = this.renderButtons(world)
    world = this.renderCheckbox(world)
    world = this.renderDialog(world)
    world = this.renderText(world)
    world = this.renderImages(world)
    world = this.renderTextInputs(world)
    world = this.renderDropdowns(world)
    return world
  }

  private renderText(world: ExtendedWorld): ExtendedWorld {
    const ctx = this.ctx

    for (const entity of this.textQuery(world)) {
      if (!UIRenderable.visible[entity]) continue

      ctx.save()
      ctx.translate(UIPosition.x[entity], UIPosition.y[entity])
      ctx.fillStyle = 'white'
      ctx.font = '16px Arial'
      ctx.textBaseline = 'top'

      const text = world.assets.getAssetById<string>(UIText.textId[entity]) || ''

      this.ctx.fillText(text, 0, 0)
      ctx.restore()
    }
    return world
  }

  private renderButtons(world: ExtendedWorld): ExtendedWorld {
    const ctx = this.ctx
    for (const entity of this.buttonQuery(world)) {
      if (!UIRenderable.visible[entity]) continue
      const x = UIPosition.x[entity]
      const y = UIPosition.y[entity]

      const width = UIRenderable.width[entity]
      const height = UIRenderable.height[entity]
      ctx.save()

      ctx.translate(x, y)

      if (!hasComponent(world, UITexture, entity)) {
        ctx.fillStyle = colorToCss(UIColor.color[entity])
        ctx.fillRect(0, 0, width, height)
      } else {
        const yOffset =
          UITexture.textureOffsetY[entity] +
          (UISelectable.pressed[entity]
            ? UITexture.textureSizeY[entity] * 2
            : UISelectable.hovered[entity]
              ? UITexture.textureSizeY[entity]
              : 0)

        ctx.drawImage(
          world.assets.getAssetById<HTMLImageElement>(UITexture.textureId[entity])!,
          UITexture.textureOffsetX[entity],
          yOffset,
          UITexture.textureSizeX[entity],
          UITexture.textureSizeY[entity],
          0,
          0,
          width,
          height
        )
      }

      ctx.fillStyle = UISelectable.pressed[entity]
        ? colorToCss(UIButton.foregroundPressed[entity])
        : UISelectable.hovered[entity]
          ? colorToCss(UIButton.foregroundHover[entity])
          : colorToCss(UIButton.foreground[entity])
      ctx.font = '32px chakra_petch'
      ctx.textBaseline = 'middle'
      ctx.textAlign = 'center'

      let text

      switch (UIText.textSource[entity]) {
        case 0:
          text = world.assets.getAssetById<string>(UIText.textId[entity]) || ''
          break
        case 1:
          text = getString(UIText.textId[entity])
          break
        default:
          text = ''
      }

      ctx.fillText(text, width / 2, height / 2, width - 10)
      ctx.restore()
    }
    return world
  }

  private renderCheckbox(world: ExtendedWorld): ExtendedWorld {
    const ctx = this.ctx
    for (const entity of this.checkboxQuery(world)) {
      if (!UIRenderable.visible[entity]) continue
      const x = UIPosition.x[entity]
      const y = UIPosition.y[entity]

      const width = UIRenderable.width[entity]
      const height = UIRenderable.height[entity]

      const yOffset =
        UITexture.textureOffsetY[entity] +
        (UICheckbox.checked[entity]
          ? UITexture.textureSizeY[entity] * 2
          : UISelectable.hovered[entity]
            ? UITexture.textureSizeY[entity]
            : 0)

      ctx.save()
      ctx.translate(x, y)
      ctx.drawImage(
        world.assets.getAssetById<HTMLImageElement>(UITexture.textureId[entity])!,
        UITexture.textureOffsetX[entity],
        yOffset,
        UITexture.textureSizeX[entity],
        UITexture.textureSizeY[entity],
        0,
        0,
        width,
        height
      )
      ctx.fillStyle = 'white'
      ctx.font = '24px chakra_petch'
      ctx.textBaseline = 'middle'
      ctx.textAlign = 'left'

      const text = world.assets.getAssetById<string>(UIText.textId[entity]) || ''
      const textHeight =
        ctx.measureText(text).actualBoundingBoxDescent -
        ctx.measureText(text).actualBoundingBoxAscent

      ctx.fillText(text, width + 10, height / 2 - textHeight / 2, 300)
      ctx.restore()
    }

    return world
  }

  private renderDialog(world: ExtendedWorld): ExtendedWorld {
    const ctx = this.ctx

    for (const entity of this.dialogQuery(world).filter((e) => Dialog.active[e])) {
      const width = UIRenderable.width[entity]
      const height = UIRenderable.height[entity]

      ctx.save()
      ctx.translate(world.renderer.width / 2 - width / 2, world.renderer.height - height - 50)
      ctx.drawImage(
        world.assets.getAssetById<HTMLImageElement>(UITexture.textureId[entity])!,
        UITexture.textureOffsetX[entity],
        UITexture.textureOffsetY[entity],
        UITexture.textureSizeX[entity],
        UITexture.textureSizeY[entity],
        0,
        0,
        width,
        height
      )

      ctx.fillStyle = 'white'
      ctx.font = '24px chakra_petch'
      ctx.textBaseline = 'top'

      const paddingY = 32
      const paddingX = 48
      const maxWidth = width - paddingX * 2
      const lineHeight = 28

      const full = getCurrentLineText(world, entity) || ''
      const fullLines = wrapText(ctx, full, maxWidth)

      const limit = DialogText.currentChar[entity] || 0
      let remaining = limit
      const visibleLines: string[] = []

      for (const line of fullLines) {
        if (remaining <= 0) break

        const segment = line.slice(0, remaining)
        visibleLines.push(segment)

        remaining -= line.length
      }

      for (let i = 0; i < visibleLines.length; i++) {
        ctx.fillText(visibleLines[i], paddingX, paddingY + i * lineHeight, maxWidth)
      }

      ctx.restore()
    }
    return world
  }

  private renderImages(world: ExtendedWorld): ExtendedWorld {
    const ctx = this.ctx

    for (const entity of this.imageQuery(world)) {
      if (!UIRenderable.visible[entity]) continue

      ctx.save()
      ctx.translate(UIPosition.x[entity], UIPosition.y[entity])

      const width = UIRenderable.width[entity]
      const height = UIRenderable.height[entity]

      ctx.drawImage(
        world.assets.getAssetById<HTMLImageElement>(UITexture.textureId[entity])!,
        UITexture.textureOffsetX[entity],
        UITexture.textureOffsetY[entity],
        UITexture.textureSizeX[entity],
        UITexture.textureSizeY[entity],
        0,
        0,
        width,
        height
      )

      ctx.restore()
    }
    return world
  }

  private renderTextInputs(world: ExtendedWorld): ExtendedWorld {
    const ctx = this.ctx

    for (const entity of this.textInputQuery(world)) {
      if (!UIRenderable.visible[entity]) continue

      const x = UIPosition.x[entity]
      const y = UIPosition.y[entity]

      const width = UIRenderable.width[entity]
      const height = UIRenderable.height[entity]

      ctx.save()
      ctx.translate(x, y)

      if (hasComponent(world, UIText, entity)) {
        ctx.fillStyle = 'white'
        const labelText = world.assets.getAssetById<string>(UIText.textId[entity]) || ''
        ctx.font = '16px chakra_petch'
        ctx.textBaseline = 'bottom'
        ctx.fillText(labelText, 0, -5)
      }

      ctx.fillRect(0, 0, width, height)

      ctx.strokeStyle = UITextInput.focused[entity] ? 'blue' : 'gray'
      ctx.lineWidth = 2
      ctx.strokeRect(0, 0, width, height)

      if (hasComponent(world, UIFont, entity)) {
        ctx.fillStyle = colorToCss(UIFont.color[entity])
        ctx.font = `${UIFont.fontSize[entity]}px ${world.assets.getAssetById<string>(UIFont.fontFamilyId[entity])}`
      } else {
        ctx.fillStyle = 'black'
        ctx.font = `${height - 10}px chakra_petch`
      }

      ctx.textBaseline = 'middle'

      const text = getString(UITextInput.textId[entity]) || ''

      ctx.fillText(text, 5, height / 2, width - 10)

      if (UITextInput.focused[entity]) {
        const cursorPos = UITextInput.cursor[entity]
        const textBeforeCursor = text.slice(0, cursorPos)
        const cursorX = ctx.measureText(textBeforeCursor).width + 5

        ctx.beginPath()
        if (hasComponent(world, UIFont, entity)) {
          ctx.moveTo(cursorX, (height - UIFont.fontSize[entity]) / 2)
          ctx.lineTo(cursorX, (height + UIFont.fontSize[entity]) / 2)
        } else {
          ctx.moveTo(cursorX, 5)
          ctx.lineTo(cursorX, height - 5)
        }
        ctx.strokeStyle = 'black'
        ctx.lineWidth = 2
        ctx.stroke()
      }

      ctx.restore()
    }

    return world
  }

  private renderDropdowns(world: ExtendedWorld): ExtendedWorld {
    const ctx = this.ctx

    for (const entity of this.dropdownQuery(world)) {
      if (!UIRenderable.visible[entity]) continue

      const x = UIPosition.x[entity]
      const y = UIPosition.y[entity]

      const width = UIRenderable.width[entity]
      const height = UIRenderable.height[entity]

      ctx.save()
      ctx.translate(x, y)

      if (hasComponent(world, UIText, entity)) {
        ctx.fillStyle = 'white'
        const labelText = world.assets.getAssetById<string>(UIText.textId[entity]) || ''
        ctx.font = '16px chakra_petch'
        ctx.textBaseline = 'bottom'
        ctx.fillText(labelText, 0, -5)
      }

      ctx.fillStyle = colorToCss(UIColor.color[entity])
      ctx.fillRect(0, 0, width, height)
      ctx.strokeStyle = 'black'
      ctx.lineWidth = 2
      ctx.strokeRect(0, 0, width, height)

      const optionsEntitis = this.dropdownOptionQuery(world).filter(
        (e) => UIDropdownOption.parentDropdown[e] === entity
      )
      const options = getDropdownOptions(entity)!

      const selectedIndex = UIDropdown.selectedIndex[entity]
      const selectedOption = options[selectedIndex]

      for (let i = 0; i < optionsEntitis.length; i++) {
        if (UIDropdown.open[entity] === 0 || UIRenderable.visible[optionsEntitis[i]] === 0) {
          continue
        }
        const optionEntity = optionsEntitis[i]
        ctx.save()
        ctx.translate(UIPosition.x[optionEntity] - x, UIPosition.y[optionEntity] - y)
        const optionIndex = UIDropdownOption.optionIndex[optionEntity]
        const option = options[optionIndex]

        if (optionIndex === selectedIndex) {
          ctx.fillStyle = colorToCss(blendColors(UIColor.color[entity], hexColor('#000000ff'), 0.5))
        } else {
          ctx.fillStyle = colorToCss(UIColor.color[entity])
        }
        ctx.fillRect(0, 0, width, height)
        ctx.strokeStyle = 'black'
        ctx.lineWidth = 2
        ctx.strokeRect(0, 0, width, height)

        ctx.fillStyle = 'black'
        ctx.font = '16px chakra_petch'
        ctx.textBaseline = 'middle'
        ctx.fillText(option.label, 5, height / 2, width - 10)

        ctx.restore()
      }

      ctx.fillStyle = 'black'
      ctx.font = '16px chakra_petch'
      ctx.textBaseline = 'middle'
      ctx.fillText(selectedOption.label, 5, height / 2, width - 10)

      ctx.restore()
    }

    return world
  }
}
