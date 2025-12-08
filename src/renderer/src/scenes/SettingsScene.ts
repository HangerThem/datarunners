import { Scene } from './Scene'
import { world } from '../ecs/world'
import { RenderSystem } from '../ecs/systems/renderSystem'
import { System } from '../ecs/systems/system'
import { UISystem } from '../ecs/systems/uiSystem'
import { CursorSystem } from '../ecs/systems/cursorSystem'
import { InputSystem } from '../ecs/systems/inputSystem'
import { createButtonEntity } from '../ecs/entities/button'
import { hexColor } from '../utils/colors'
import { getAllEntities, removeEntity } from 'bitecs'
import { createCheckboxEntity } from '../ecs/entities/checkbox'

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

  constructor() {
    this.systems = [new UISystem(), new CursorSystem(), new InputSystem(), new RenderSystem()]
  }

  async load(): Promise<void> {
    this.settingsData = await window.electron.ipcRenderer.invoke('settings:load')

    if (this.settingsData == null) {
      world.scenes.loadScene('main_menu')
      return
    }

    await world.assets.loadImages([
      {
        name: 'checkbox_normal',
        src: 'assets/ui/checkbox_normal.png'
      }
    ])

    await world.assets.loadTexts([
      {
        name: 'back_button_text',
        src: 'assets/texts/buttons/back_button_text.json'
      },
      {
        name: 'save_button_text',
        src: 'assets/texts/buttons/save_button_text.json'
      }
    ])

    createButtonEntity(
      world,
      'back_button_text',
      world.renderer.width / 2 - (512 * 0.75) / 2,
      256,
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
        world.scenes.loadScene('main_menu')
      })
    )

    createButtonEntity(
      world,
      'save_button_text',
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
        window.electron.ipcRenderer.send('settings:save', this.settingsData)
        world.audio.playSound('click_sound')
      })
    )

    createCheckboxEntity(
      world,
      'checkbox_normal',
      32,
      32,
      0.5,
      64,
      64,
      0,
      0,
      this.settingsData.graphics['fullscreen'] ? true : false,
      world.callbacks.registerCallback(() => {
        world.audio.playSound('click_sound')
        this.settingsData!.graphics['fullscreen'] = !this.settingsData!.graphics['fullscreen']
      })
    )
  }

  update(dt: number): void {
    for (const sys of this.systems) {
      sys.update(world, dt)
    }
  }

  async unload(): Promise<void> {
    for (const entity of getAllEntities(world)) {
      removeEntity(world, entity)
    }
  }
}
