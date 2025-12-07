import { defineQuery } from 'bitecs'
import { UIPosition } from '../components/uiPosition'
import type { ExtendedWorld } from '../world'
import { Dialog, DialogText } from '../components/dialog'
import { getCurrentLineText } from './dialog'
import { UIButton } from '../components/uiButton'
import { UICallback } from '../components/uiCallback'
import { UIRenderable } from '../components/uiRenderable'
import { colorToCss } from '../../utils/colors'

const dialogQuery = defineQuery([UIPosition, Dialog])

function renderDialog(world: ExtendedWorld, entity: number): void {
  const ctx = world.renderer.ctx

  const width = UIPosition.width[entity]
  const height = UIPosition.height[entity]

  ctx.fillStyle = 'rgba(0, 0, 0, 0.7)'
  ctx.save()
  ctx.translate(world.renderer.width / 2 - width / 2, world.renderer.height - height - 50)
  ctx.fillRect(0, 0, width, height)

  ctx.strokeStyle = 'white'
  ctx.lineWidth = 2
  ctx.strokeRect(0, 0, width, height)

  ctx.fillStyle = 'white'
  ctx.font = '16px Arial'
  ctx.textBaseline = 'top'

  const padding = 10

  ctx.fillText(
    getCurrentLineText(world, entity).slice(0, DialogText.currentChar[entity]),
    padding,
    padding,
    width - padding * 2
  )

  ctx.restore()
}

const buttonQuery = defineQuery([UIPosition, UIButton, UICallback])

function renderButton(world: ExtendedWorld, entity: number): void {
  const ctx = world.renderer.ctx

  const x = UIPosition.x[entity]
  const y = UIPosition.y[entity]
  const width = UIPosition.width[entity]
  const height = UIPosition.height[entity]

  const yOffset =
    UIButton.textureOffsetY[entity] +
    (UIButton.pressed[entity]
      ? UIButton.textureSizeY[entity] * 2
      : UIButton.hovered[entity]
        ? UIButton.textureSizeY[entity]
        : 0)

  ctx.save()
  ctx.translate(x, y)
  ctx.drawImage(
    world.assets.getAssetById<HTMLImageElement>(UIButton.textureId[entity])!,
    UIButton.textureOffsetX[entity],
    yOffset,
    UIButton.textureSizeX[entity],
    UIButton.textureSizeY[entity],
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

  const text = world.assets.getAssetById<string>(UIRenderable.textId[entity]) || ''

  ctx.fillText(text, width / 2, height / 2, width - 10)
  ctx.restore()
}

const renderQuery = defineQuery([UIPosition, UIRenderable])

function renderEntity(world: ExtendedWorld, entity: number): void {
  const ctx = world.renderer.ctx
  ctx.save()
  ctx.translate(UIPosition.x[entity], UIPosition.y[entity])
  ctx.fillStyle = 'white'
  ctx.font = '16px Arial'
  ctx.textBaseline = 'top'

  const text = world.assets.getAssetById<string>(UIRenderable.textId[entity]) || ''

  ctx.fillText(text, 0, 0)
  ctx.restore()
}

export function renderSystem(world: ExtendedWorld): ExtendedWorld {
  const ctx = world.renderer.ctx
  ctx.fillStyle = 'black'
  ctx.fillRect(0, 0, world.renderer.width, world.renderer.height)

  const renderableEntities = renderQuery(world).filter((eid) => !UIButton.foreground[eid])
  for (const entity of renderableEntities) {
    renderEntity(world, entity)
  }

  const currentDialog = dialogQuery(world).find((eid) => Dialog.active[eid] === 1)

  if (currentDialog !== undefined) {
    renderDialog(world, currentDialog)
  }

  const buttonEntities = buttonQuery(world)
  for (const entity of buttonEntities) {
    renderButton(world, entity)
  }

  return world
}
