import { Scene, SceneAssets } from './Scene'
import { world } from '../ecs/world'
import { RenderSystem } from '../ecs/systems/renderSystem'
import { System } from '../ecs/systems/system'
import { UISystem } from '../ecs/systems/uiSystem'
import { CursorSystem } from '../ecs/systems/cursorSystem'
import { InputSystem } from '../ecs/systems/inputSystem'
import { hexColor } from '../utils/colors'
import { addComponent, addEntity } from 'bitecs'
import { UIRenderable } from '../ecs/components/ui/uiRenderable'
import { UIPosition } from '../ecs/components/ui/uiPosition'
import { UIText } from '../ecs/components/ui/uiText'
import { allocString, editString } from '../utils/stringAllocator'
import { UISelectable } from '../ecs/components/ui/uiSelectable'
import { TextInputSystem } from '../ecs/systems/textInputSystem'
import { UITextInput } from '../ecs/components/ui/uiTextInput'
import { UIFont } from '../ecs/components/ui/uiFont'
import { UIButtonSchema } from '../types/button.types'
import { createButtonEntity } from '../ecs/entities/button'
import { DifficultyOptions } from '../data/DifficultyOptions'
import { UIDropdownSchema } from '../types/dropdown.types'
import { createDropdownEntity } from '../ecs/entities/dropdown'

interface NewGameData {
  difficulty: string | number
  seed: number
}

export class NewGameScene implements Scene {
  private systems: System[]
  private newGameData: NewGameData = {
    difficulty: DifficultyOptions[1].value,
    seed: Math.floor(Math.random() * 1000000)
  }
  private assets: SceneAssets = {
    images: [{ name: 'checkbox_normal', src: 'ui/checkbox_normal.png' }],
    fonts: [{ name: 'chakra_petch', src: 'ChakraPetch.ttf' }],
    audio: [{ name: 'click_sound', src: 'click.mp3' }],
    texts: []
  }

  constructor() {
    this.systems = [
      new UISystem(),
      new CursorSystem(),
      new TextInputSystem(),
      new InputSystem(),
      new RenderSystem()
    ]
  }

  async load(): Promise<void> {
    await world.assets.loadSceneAssets(this.assets)

    const inputEntity = addEntity(world)

    addComponent(world, UIText, inputEntity)
    addComponent(world, UIPosition, inputEntity)
    addComponent(world, UIRenderable, inputEntity)
    addComponent(world, UISelectable, inputEntity)
    addComponent(world, UITextInput, inputEntity)
    addComponent(world, UIFont, inputEntity)

    UIPosition.x[inputEntity] = world.renderer.width / 2 - 100
    UIPosition.y[inputEntity] = 720

    UIRenderable.width[inputEntity] = 200
    UIRenderable.height[inputEntity] = 40
    UIRenderable.visible[inputEntity] = 1

    UIText.textId[inputEntity] = world.assets.addTextAsset(
      'seed_input_label',
      'Enter Seed (Numbers Only):'
    )
    UIText.textSource[inputEntity] = 0

    UITextInput.maxLength[inputEntity] = 8
    UITextInput.numeric[inputEntity] = 1
    UITextInput.cursor[inputEntity] = this.newGameData.seed.toString().length
    UITextInput.textId[inputEntity] = allocString(this.newGameData.seed.toString())

    UIFont.fontSize[inputEntity] = 24
    UIFont.fontFamilyId[inputEntity] = world.assets.getAssetId('chakra_petch')!
    UIFont.color[inputEntity] = hexColor('#000000ff')

    const newSeedButton = UIButtonSchema.safeDecode({
      textId: world.assets.addTextAsset('new_seed_button_text', 'New Seed'),
      x: world.renderer.width / 2 + 120,
      y: 720,
      width: 120,
      height: 40,
      foregroundColor: hexColor('#FFFFFFFF'),
      hoverForegroundColor: hexColor('#00FF00FF'),
      pressedForegroundColor: hexColor('#00FF00FF'),
      callbackId: world.callbacks.registerCallback(() => {
        world.audio.playSound('click_sound')
        this.newGameData.seed = Math.floor(Math.random() * 1000000)
        editString(UITextInput.textId[inputEntity], this.newGameData.seed.toString())
        UITextInput.cursor[inputEntity] = this.newGameData.seed.toString().length
      })
    })

    if (!newSeedButton.success) {
      console.error('Failed to create new seed button:', newSeedButton.error)
      return
    }

    createButtonEntity(newSeedButton.data)

    const difficultyDropdown = UIDropdownSchema.safeDecode({
      labelId: world.assets.addTextAsset('difficulty_dropdown_label', 'Select Difficulty:'),
      x: world.renderer.width / 2 - 100,
      y: 600,
      width: 200,
      height: 40,
      selectedIndex: 1,
      options: DifficultyOptions,
      foregroundColor: hexColor('#FFFFFFFF'),
      hoverForegroundColor: hexColor('#00FF00FF'),
      pressedForegroundColor: hexColor('#00FF00FF'),
      backgroundColor: hexColor('#CCCCCCFF')
    })

    if (!difficultyDropdown.success) {
      console.error('Failed to create difficulty dropdown:', difficultyDropdown.error)
      return
    }

    createDropdownEntity(difficultyDropdown.data)
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
