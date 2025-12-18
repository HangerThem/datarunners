import { Scene, SceneAssets } from './Scene'
import { world } from '../ecs/world'
import { RenderSystem } from '../ecs/systems/renderSystem'
import { System } from '../ecs/systems/system'
import { UISystem } from '../ecs/systems/uiSystem'
import { CursorSystem } from '../ecs/systems/cursorSystem'
import { InputSystem } from '../ecs/systems/inputSystem'
import { createButtonEntity } from '../ecs/entities/button'
import { hexColor } from '../utils/colors'
import { createCheckboxEntity } from '../ecs/entities/checkbox'
import { UIButtonSchema } from '../types/button.types'
import { UICheckboxSchema } from '../types/checkbox.types'

interface GameSettings {
  graphics: {
    resolution: {
      width: number
      height: number
    }
    fullscreen: boolean
  }
}

export class SettingsScene implements Scene {
  private systems: System[]
  private settingsData: GameSettings | null = null
  private assets: SceneAssets = {
    images: [
      {
        name: 'button_normal_medium',
        src: 'ui/button_normal_medium.png'
      },
      {
        name: 'checkbox_normal',
        src: 'ui/checkbox_normal.png'
      }
    ],
    fonts: [],
    audio: [{ name: 'click_sound', src: 'click.mp3' }],
    texts: [
      {
        name: 'back_button_text',
        src: 'buttons/back.json'
      },
      {
        name: 'save_button_text',
        src: 'buttons/save.json'
      },
      {
        name: 'fullscreen_checkbox_text',
        src: 'checkboxes/fullscreen.json'
      }
    ]
  }

  constructor() {
    this.systems = [new UISystem(), new CursorSystem(), new InputSystem(), new RenderSystem()]
  }

  async load(): Promise<void> {
    this.settingsData = await window.electron.ipcRenderer.invoke('settings:load')

    if (this.settingsData == null) {
      world.scenes.loadScene('main_menu')
      return
    }

    await world.assets.loadSceneAssets(this.assets)

    const backButton = UIButtonSchema.safeDecode({
      textId: world.assets.getAssetId('back_button_text')!,
      x: world.renderer.width / 2 - (512 * 0.75) / 2,
      y: 256,
      width: 512 * 0.75,
      height: 160 * 0.75,
      textureId: world.assets.getAssetId('button_normal_medium'),
      textureSizeX: 512,
      textureSizeY: 160,
      hoverForegroundColor: hexColor('#00FF00FF'),
      pressedForegroundColor: hexColor('#00FF00FF'),
      callbackId: world.callbacks.registerCallback(() => {
        world.audio.playSound('click_sound')
        world.scenes.loadScene('main_menu')
      })
    })

    if (!backButton.success) {
      console.error('Failed to create back button:', backButton.error)
      return
    }

    createButtonEntity(backButton.data)

    const saveButton = UIButtonSchema.safeDecode({
      textId: world.assets.getAssetId('save_button_text'),
      x: world.renderer.width / 2 - (512 * 0.75) / 2,
      y: 400,
      width: 512 * 0.75,
      height: 160 * 0.75,
      textureId: world.assets.getAssetId('button_normal_medium'),
      textureSizeX: 512,
      textureSizeY: 160,
      hoverForegroundColor: hexColor('#00FF00FF'),
      pressedForegroundColor: hexColor('#00FF00FF'),
      callbackId: world.callbacks.registerCallback(() => {
        world.audio.playSound('click_sound')
        window.electron.ipcRenderer.send('settings:save', this.settingsData)
      })
    })

    if (!saveButton.success) {
      console.error('Failed to create save button:', saveButton.error)
      return
    }

    createButtonEntity(saveButton.data)

    const fullscreenCheckbox = UICheckboxSchema.safeDecode({
      labelId: world.assets.getAssetId('fullscreen_checkbox_text'),
      x: world.renderer.width / 2 - (512 * 0.75) / 2,
      y: 560,
      width: 32,
      height: 32,
      textureId: world.assets.getAssetId('checkbox_normal'),
      textureSizeX: 64,
      textureSizeY: 64,
      checked: this.settingsData.graphics['fullscreen'] ? true : false,
      callbackId: world.callbacks.registerCallback(() => {
        world.audio.playSound('click_sound')
        this.settingsData!.graphics['fullscreen'] = !this.settingsData!.graphics['fullscreen']
      })
    })

    if (!fullscreenCheckbox.success) {
      console.error('Failed to create fullscreen checkbox:', fullscreenCheckbox.error)
      return
    }

    createCheckboxEntity(fullscreenCheckbox.data)
  }

  update(dt: number): void {
    for (const sys of this.systems) {
      sys.update(world, dt)
    }
  }

  async unload(): Promise<void> {
    world.reset()
  }
}
