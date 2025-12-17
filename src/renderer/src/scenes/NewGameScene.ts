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
import { allocString } from '../utils/stringAllocator'
import { UISelectable } from '../ecs/components/ui/uiSelectable'
import { TextInputSystem } from '../ecs/systems/textInputSystem'
import { UITextInput } from '../ecs/components/ui/uiTextInput'
import { UIFont } from '../ecs/components/ui/uiFont'
import { createCheckboxEntity } from '../ecs/entities/checkbox'
import { UICheckboxSchema } from '../types/checkbox.types'

enum Difficulty {
  EASY = 'easy',
  NORMAL = 'normal',
  HARD = 'hard'
}

interface NewGameData {
  difficulty: Difficulty
  seed: number
}

export class NewGameScene implements Scene {
  private systems: System[]
  private newGameData: NewGameData = {
    difficulty: Difficulty.NORMAL,
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

    const checkboxGroup = addEntity(world)

    for (const diff of [Difficulty.EASY, Difficulty.NORMAL, Difficulty.HARD]) {
      const checkboxEntity = UICheckboxSchema.safeDecode({
        x: world.renderer.width / 2 - (512 * 0.75) / 2,
        y: diff === Difficulty.EASY ? 400 : diff === Difficulty.NORMAL ? 500 : 600,
        width: 32,
        height: 32,
        textureId: world.assets.getAssetId('checkbox_normal')!,
        textureSizeX: 64,
        textureSizeY: 64,
        checked: this.newGameData.difficulty === diff,
        callbackId: world.callbacks.registerCallback(() => {
          world.audio.playSound('click_sound')
          this.newGameData.difficulty = diff
        }),
        textId: world.assets.addTextAsset(
          `${diff}_checkbox_text`,
          diff.charAt(0).toUpperCase() + diff.slice(1)
        ),
        groupId: checkboxGroup
      })

      if (checkboxEntity.success) {
        createCheckboxEntity(checkboxEntity.data)
      }
    }
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
