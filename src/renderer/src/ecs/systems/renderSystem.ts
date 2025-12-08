import { defineQuery } from 'bitecs'
import { UIPosition } from '../components/uiPosition'
import { world, type ExtendedWorld } from '../world'
import { Dialog, DialogText } from '../components/dialog'
import { getCurrentLineText } from '../../utils/text'
import { UIButton } from '../components/uiButton'
import { UIRenderable } from '../components/uiRenderable'
import { colorToCss } from '../../utils/colors'
import { wrapText } from '../../utils/text'
import { UITexture } from '../components/uiTexture'
import { System } from './system'
import { UIText } from '../components/uiText'
import { UIPureText } from '../components/uiPureText'
import { UICheckbox } from '../components/uiCheckbox'

export class RenderSystem implements System {
  private ctx: CanvasRenderingContext2D
  private textQuery = defineQuery([UIPosition, UIRenderable, UIPureText])
  private buttonQuery = defineQuery([UIPosition, UIButton])
  private dialogQuery = defineQuery([UIPosition, Dialog])
  private checkboxQuery = defineQuery([UIPosition, UICheckbox])

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

      const yOffset =
        UITexture.textureOffsetY[entity] +
        (UIButton.pressed[entity]
          ? UITexture.textureSizeY[entity] * 2
          : UIButton.hovered[entity]
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

      ctx.fillStyle = UIButton.pressed[entity]
        ? colorToCss(UIButton.foregroundPressed[entity])
        : UIButton.hovered[entity]
          ? colorToCss(UIButton.foregroundHover[entity])
          : colorToCss(UIButton.foreground[entity])
      ctx.font = '32px chakra_petch'
      ctx.textBaseline = 'middle'
      ctx.textAlign = 'center'

      const text = world.assets.getAssetById<string>(UIText.textId[entity]) || ''

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
        (UICheckbox.hovered[entity]
          ? UITexture.textureSizeY[entity]
          : UICheckbox.checked[entity]
            ? UITexture.textureSizeY[entity] * 2
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
}
