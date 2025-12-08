import { Scene } from './Scene'
import { world } from '../ecs/world'
import { RenderSystem } from '../ecs/systems/renderSystem'
import { System } from '../ecs/systems/system'
import { DialogSystem } from '../ecs/systems/dialogSystem'
import { UISystem } from '../ecs/systems/uiSystem'
import { CursorSystem } from '../ecs/systems/cursorSystem'
import { InputSystem } from '../ecs/systems/inputSystem'
import { registerEntities } from '../ecs/entities/registerEntities'
import { getAllEntities, removeEntity } from 'bitecs'

export class MainMenuScene implements Scene {
  private systems: System[]

  constructor() {
    this.systems = [
      new DialogSystem(),
      new UISystem(),
      new CursorSystem(),
      new InputSystem(),
      new RenderSystem()
    ]
  }

  async load(): Promise<void> {
    await world.assets.loadImages([
      { name: 'button_normal_medium', src: 'assets/ui/button_normal_medium.png' },
      { name: 'button_danger_medium', src: 'assets/ui/button_danger_medium.png' },
      { name: 'dialog', src: 'assets/ui/dialog.png' }
    ])

    await world.assets.loadTexts([
      { name: 'dialog_01', src: 'assets/texts/dialog_01.json' },
      {
        name: 'start_button_text',
        src: 'assets/texts/buttons/start_button_text.json'
      },
      {
        name: 'quit_button_text',
        src: 'assets/texts/buttons/quit_button_text.json'
      },
      {
        name: 'settings_button_text',
        src: 'assets/texts/buttons/settings_button_text.json'
      }
    ])
    await world.assets.loadAudios([{ name: 'click_sound', src: 'assets/audio/click.mp3' }])

    await world.assets.loadFonts([{ name: 'chakra_petch', src: 'assets/fonts/ChakraPetch.ttf' }])

    registerEntities(world)
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
