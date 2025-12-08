import { addComponent, addEntity } from 'bitecs'
import { hexColor } from '../../utils/colors'
import { Dialog } from '../components/dialog'
import type { ExtendedWorld } from '../world'
import { createButtonEntity } from './button'
import { createDialogEntity } from './dialog'
import { UIRenderable } from '../components/uiRenderable'
import { UIPosition } from '../components/uiPosition'
import { UITexture } from '../components/uiTexture'
import { Image } from '../components/image'

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

  const dialog = createDialogEntity(world, 'dialog_01', 1024, 256, 'dialog', 1024, 256, 0, 0)

  createButtonEntity(
    world,
    'start_button_text',
    world.renderer.width / 2 - (512 * 0.75) / 2,
    400,
    0.75,
    'button_normal_medium',
    512,
    160,
    0,
    0,
    hexColor('#FFFFFFFF'),
    hexColor('#00FF00FF'),
    hexColor('#00FF00FF'),
    world.callbacks.registerCallback(() => {
      world.audio.playSound('click_sound')
      Dialog.active[dialog] = 1
    })
  )

  createButtonEntity(
    world,
    'settings_button_text',
    world.renderer.width / 2 - (512 * 0.75) / 2,
    560,
    0.75,
    'button_normal_medium',
    512,
    160,
    0,
    0,
    hexColor('#FFFFFFFF'),
    hexColor('#00FF00FF'),
    hexColor('#00FF00FF'),
    world.callbacks.registerCallback(() => {
      world.audio.playSound('click_sound')
      world.scenes.loadScene('settings')
    })
  )

  createButtonEntity(
    world,
    'quit_button_text',
    world.renderer.width / 2 - (512 * 0.75) / 2,
    720,
    0.75,
    'button_danger_medium',
    512,
    160,
    0,
    0,
    hexColor('#FFFFFFFF'),
    hexColor('#FF3B5AFF'),
    hexColor('#FF3B5AFF'),
    world.callbacks.registerCallback(() => {
      world.audio.playSound('click_sound')
      window.close()
    })
  )
}
