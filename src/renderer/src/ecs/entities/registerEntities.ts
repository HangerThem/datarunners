import { addComponent, addEntity } from 'bitecs'
import { hexColor } from '../../utils/colors'
import type { ExtendedWorld } from '../world'
import { createButtonEntity } from './button'
import { UIRenderable } from '../components/ui/uiRenderable'
import { UIPosition } from '../components/ui/uiPosition'
import { UITexture } from '../components/ui/uiTexture'
import { Image } from '../components/image'
import { UIButtonSchema } from '../../types/button.types'

export function registerEntities(world: ExtendedWorld): void {
  const loading = addEntity(world)

  addComponent(world, UIRenderable, loading)
  addComponent(world, UIPosition, loading)
  addComponent(world, UITexture, loading)
  addComponent(world, Image, loading)

  UIRenderable.visible[loading] = 1

  UIPosition.x[loading] = world.renderer.width / 2 - 256
  UIPosition.y[loading] = 64

  UIRenderable.width[loading] = 512
  UIRenderable.height[loading] = 256

  UITexture.textureId[loading] = world.assets.getAssetId('splash')!
  UITexture.textureSizeX[loading] = 1024
  UITexture.textureSizeY[loading] = 512

  const startButton = UIButtonSchema.safeDecode({
    textId: world.assets.getAssetId('start_button_text')!,
    x: world.renderer.width / 2 - (512 * 0.75) / 2,
    y: 400,
    width: 512 * 0.75,
    height: 160 * 0.75,
    textureId: world.assets.getAssetId('button_normal_medium')!,
    textureSizeX: 512,
    textureSizeY: 160,
    foregroundColor: hexColor('#FFFFFFFF'),
    hoverForegroundColor: hexColor('#00FF00FF'),
    pressedForegroundColor: hexColor('#00FF00FF'),
    callbackId: world.callbacks.registerCallback(() => {
      world.audio.playSound('click_sound')
      world.scenes.loadScene('saves')
    })
  })

  if (!startButton.success) {
    console.error('Failed to create start button:', startButton.error)
    return
  }

  createButtonEntity(startButton.data)

  const settingsButton = UIButtonSchema.safeDecode({
    textId: world.assets.getAssetId('settings_button_text')!,
    x: world.renderer.width / 2 - (512 * 0.75) / 2,
    y: 560,
    width: 512 * 0.75,
    height: 160 * 0.75,
    textureId: world.assets.getAssetId('button_normal_medium')!,
    textureSizeX: 512,
    textureSizeY: 160,
    foregroundColor: hexColor('#FFFFFFFF'),
    hoverForegroundColor: hexColor('#00FF00FF'),
    pressedForegroundColor: hexColor('#00FF00FF'),
    callbackId: world.callbacks.registerCallback(() => {
      world.audio.playSound('click_sound')
      world.scenes.loadScene('settings')
    })
  })

  if (!settingsButton.success) {
    console.error('Failed to create settings button:', settingsButton.error)
    return
  }

  createButtonEntity(settingsButton.data)

  const quitButton = UIButtonSchema.safeDecode({
    textId: world.assets.getAssetId('quit_button_text')!,
    x: world.renderer.width / 2 - (512 * 0.75) / 2,
    y: 720,
    width: 512 * 0.75,
    height: 160 * 0.75,
    textureId: world.assets.getAssetId('button_danger_medium')!,
    textureSizeX: 512,
    textureSizeY: 160,
    foregroundColor: hexColor('#FFFFFFFF'),
    hoverForegroundColor: hexColor('#FF3B5AFF'),
    pressedForegroundColor: hexColor('#FF3B5AFF'),
    callbackId: world.callbacks.registerCallback(() => {
      world.audio.playSound('click_sound')
      window.close()
    })
  })

  if (!quitButton.success) {
    console.error('Failed to create quit button:', quitButton.error)
    return
  }

  createButtonEntity(quitButton.data)
}
