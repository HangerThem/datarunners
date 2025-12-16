import { Scene } from './Scene'
import { world } from '../ecs/world'
import { RenderSystem } from '../ecs/systems/renderSystem'
import { System } from '../ecs/systems/system'
import { UISystem } from '../ecs/systems/uiSystem'
import { CursorSystem } from '../ecs/systems/cursorSystem'
import { InputSystem } from '../ecs/systems/inputSystem'
import { createButtonEntity } from '../ecs/entities/button'
import { hexColor } from '../utils/colors'
import { addComponent, addEntity, getAllEntities, removeEntity } from 'bitecs'
import { createCheckboxEntity } from '../ecs/entities/checkbox'
import { UIText } from '../ecs/components/ui/uiText'
import { UIPosition } from '../ecs/components/ui/uiPosition'
import { UIRenderable } from '../ecs/components/ui/uiRenderable'
import { UISelectable } from '../ecs/components/ui/uiSelectable'
import { TextInput } from '../ecs/components/textInput'
import { allocString } from '../utils/stringAllocator'
import { TextEditSystem } from '../ecs/systems/textEditSystem'
import { UIFont } from '../ecs/components/ui/uiFont'
import { UIButtonSchema } from '../types/button.types'

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
    this.systems = [
      new UISystem(),
      new CursorSystem(),
      new TextEditSystem(),
      new InputSystem(),
      new RenderSystem()
    ]
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
        src: 'ui/checkbox_normal.png'
      }
    ])

    await world.assets.loadTexts([
      {
        name: 'back_button_text',
        src: 'buttons/back.json'
      },
      {
        name: 'save_button_text',
        src: 'buttons/save.json'
      }
    ])

    const backButton = UIButtonSchema.parse({
      textId: world.assets.getAssetId('back_button_text')!,
      x: world.renderer.width / 2 - (512 * 0.75) / 2,
      y: 256,
      scale: 0.75,
      textureId: world.assets.getAssetId('button_normal_medium')!,
      textureSizeX: 512,
      textureSizeY: 160,
      foregroundColor: hexColor('#FFFFFFFF'),
      hoverForegroundColor: hexColor('#00FF00FF'),
      pressedForegroundColor: hexColor('#00FF00FF'),
      callbackId: world.callbacks.registerCallback(() => {
        world.audio.playSound('click_sound')
        world.scenes.loadScene('main_menu')
      })
    })

    createButtonEntity(backButton)

    const saveButton = UIButtonSchema.parse({
      textId: world.assets.getAssetId('save_button_text')!,
      x: world.renderer.width / 2 - (512 * 0.75) / 2,
      y: 400,
      scale: 0.75,
      textureId: world.assets.getAssetId('button_normal_medium')!,
      textureSizeX: 512,
      textureSizeY: 160,
      foregroundColor: hexColor('#FFFFFFFF'),
      hoverForegroundColor: hexColor('#00FF00FF'),
      pressedForegroundColor: hexColor('#00FF00FF'),
      callbackId: world.callbacks.registerCallback(() => {
        world.audio.playSound('click_sound')
        window.electron.ipcRenderer.send('settings:save', this.settingsData)
      })
    })

    createButtonEntity(saveButton)

    createCheckboxEntity(
      world,
      'checkbox_normal',
      world.renderer.width / 2 - (512 * 0.75) / 2,
      560,
      0.5,
      64,
      64,
      0,
      0,
      this.settingsData.graphics['fullscreen'] ? true : false,
      world.callbacks.registerCallback(() => {
        world.audio.playSound('click_sound')
        this.settingsData!.graphics['fullscreen'] = !this.settingsData!.graphics['fullscreen']
      }),
      world.assets.addTextAsset('fullscreen_checkbox_text', 'Fullscreen')
    )

    const inputEntity = addEntity(world)

    addComponent(world, UIText, inputEntity)
    addComponent(world, UIPosition, inputEntity)
    addComponent(world, UIRenderable, inputEntity)
    addComponent(world, UISelectable, inputEntity)
    addComponent(world, TextInput, inputEntity)
    addComponent(world, UIFont, inputEntity)

    UIPosition.x[inputEntity] = world.renderer.width / 2 - 100
    UIPosition.y[inputEntity] = 720

    UIRenderable.width[inputEntity] = 200
    UIRenderable.height[inputEntity] = 40
    UIRenderable.visible[inputEntity] = 1

    UIText.textId[inputEntity] = allocString('')
    UIText.textSource[inputEntity] = 2

    TextInput.cursor[inputEntity] = 0
    TextInput.maxLength[inputEntity] = 256
    TextInput.focused[inputEntity] = 0

    UIFont.fontSize[inputEntity] = 24
    UIFont.fontFamilyId[inputEntity] = world.assets.getAssetId('chakra_petch')!
    UIFont.color[inputEntity] = hexColor('#000000ff')
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
