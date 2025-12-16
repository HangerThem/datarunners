import { Scene } from './Scene'
import { world } from '../ecs/world'
import { RenderSystem } from '../ecs/systems/renderSystem'
import { System } from '../ecs/systems/system'
import { UISystem } from '../ecs/systems/uiSystem'
import { CursorSystem } from '../ecs/systems/cursorSystem'
import { InputSystem } from '../ecs/systems/inputSystem'
import { hexColor } from '../utils/colors'
import { addComponent, addEntity, getAllEntities, removeEntity } from 'bitecs'
import { UIRenderable } from '../ecs/components/ui/uiRenderable'
import { UIPosition } from '../ecs/components/ui/uiPosition'
import { UIText } from '../ecs/components/ui/uiText'
import { allocString } from '../utils/stringAllocator'
import { UISelectable } from '../ecs/components/ui/uiSelectable'
import { TextEditSystem } from '../ecs/systems/textEditSystem'
import { TextInput } from '../ecs/components/textInput'
import { UIFont } from '../ecs/components/ui/uiFont'
import { createCheckboxEntity } from '../ecs/entities/checkbox'
import { UICheckbox } from '../ecs/components/ui/uiCheckbox'
import { UICallback } from '../ecs/components/ui/uiCallback'

enum Difficulty {
  EASY = 'easy',
  NORMAL = 'normal',
  HARD = 'hard'
}

interface NewGameData {
  difficulty: Difficulty
  seed: string
}

export class NewGameScene implements Scene {
  private systems: System[]
  private newGameData: NewGameData = { difficulty: Difficulty.NORMAL, seed: '' }

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

    const checkboxs: number[] = []

    for (const diff of [Difficulty.EASY, Difficulty.NORMAL, Difficulty.HARD]) {
      checkboxs.push(
        createCheckboxEntity(
          world,
          'checkbox_normal',
          world.renderer.width / 2 - (512 * 0.75) / 2,
          diff === Difficulty.EASY ? 400 : diff === Difficulty.NORMAL ? 500 : 600,
          0.5,
          64,
          64,
          0,
          0,
          this.newGameData.difficulty === diff,
          -1,
          world.assets.addTextAsset(
            `${diff}_checkbox_text`,
            diff.charAt(0).toUpperCase() + diff.slice(1)
          )
        )
      )
    }

    for (const checkbox of checkboxs) {
      UICallback.onClick[checkbox] = world.callbacks.registerCallback(() => {
        world.audio.playSound('click_sound')
        for (let i = 0; i < checkboxs.length; i++) {
          const cb = checkboxs[i]
          if (cb === checkbox) {
            this.newGameData.difficulty =
              i === 0 ? Difficulty.EASY : i === 1 ? Difficulty.NORMAL : Difficulty.HARD
            UICheckbox.checked[cb] = 1
          } else {
            UICheckbox.checked[cb] = 0
          }
        }
      })
    }
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
