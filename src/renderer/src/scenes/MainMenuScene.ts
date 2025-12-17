import { Scene, SceneAssets } from './Scene'
import { world } from '../ecs/world'
import { RenderSystem } from '../ecs/systems/renderSystem'
import { System } from '../ecs/systems/system'
import { DialogSystem } from '../ecs/systems/dialogSystem'
import { UISystem } from '../ecs/systems/uiSystem'
import { CursorSystem } from '../ecs/systems/cursorSystem'
import { InputSystem } from '../ecs/systems/inputSystem'
import { registerEntities } from '../ecs/entities/registerEntities'

export class MainMenuScene implements Scene {
  private systems: System[]
  private assets: SceneAssets = {
    images: [
      { name: 'button_normal_medium', src: 'ui/button_normal_medium.png' },
      { name: 'button_danger_medium', src: 'ui/button_danger_medium.png' },
      { name: 'splash', src: 'splash.png' }
    ],
    fonts: [{ name: 'chakra_petch', src: 'ChakraPetch.ttf' }],
    audio: [{ name: 'click_sound', src: 'click.mp3' }],
    texts: [
      {
        name: 'start_button_text',
        src: 'buttons/start.json'
      },
      {
        name: 'quit_button_text',
        src: 'buttons/quit.json'
      },
      {
        name: 'settings_button_text',
        src: 'buttons/settings.json'
      }
    ]
  }

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
    await world.assets.loadSceneAssets(this.assets)

    registerEntities(world)
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
