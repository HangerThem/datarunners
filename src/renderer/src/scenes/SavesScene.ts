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
import { UIColor } from '../ecs/components/ui/uiColor'
import { allocString } from '../utils/stringAllocator'
import { UIButton } from '../ecs/components/uiButton'
import { UICallback } from '../ecs/components/ui/uiCallback'
import { UISelectable } from '../ecs/components/ui/uiSelectable'

interface SaveData {
  slot: number
  timestamp: number
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  gameState: any
}

export class SavesScene implements Scene {
  private systems: System[]
  private saveData: SaveData[] | null = null

  constructor() {
    this.systems = [new UISystem(), new CursorSystem(), new InputSystem(), new RenderSystem()]
  }

  async load(): Promise<void> {
    this.saveData = await window.electron.ipcRenderer.invoke('saves:load')

    if (this.saveData == null) {
      world.scenes.loadScene('main_menu')
      return
    }

    await world.assets.loadTexts([
      {
        name: 'empty_slot',
        src: 'buttons/empty_slot.json'
      },
      {
        name: 'delete_slot',
        src: 'buttons/delete_slot.json'
      }
    ])

    for (let i = 0; i < 3; i++) {
      const entity = addEntity(world)

      addComponent(world, UIRenderable, entity)
      addComponent(world, UIPosition, entity)
      addComponent(world, UIText, entity)
      addComponent(world, UIColor, entity)
      addComponent(world, UIButton, entity)

      UIRenderable.visible[entity] = 1
      UIRenderable.width[entity] = 600
      UIRenderable.height[entity] = 80

      UIPosition.x[entity] = world.renderer.width / 2 - 300
      UIPosition.y[entity] = 100 + i * 100

      if (i >= this.saveData.length!) {
        UIText.textId[entity] = world.assets.getAssetId('empty_slot')!
        UIText.textSource[entity] = 1

        UIColor.color[entity] = hexColor('#888888FF')
      } else {
        const save = this.saveData[i]
        const date = new Date(save.timestamp)
        const dateString = date.toLocaleString()

        UIText.textId[entity] = allocString(`Save Slot ${save.slot}\nLast Played: ${dateString}`)
        UIText.textSource[entity] = 2
        UIColor.color[entity] = hexColor('#00ff00ff')
        UIRenderable.width[entity] = 450

        const deleteButton = addEntity(world)

        addComponent(world, UIRenderable, deleteButton)
        addComponent(world, UIPosition, deleteButton)
        addComponent(world, UIText, deleteButton)
        addComponent(world, UIColor, deleteButton)
        addComponent(world, UIButton, deleteButton)
        addComponent(world, UICallback, deleteButton)
        addComponent(world, UISelectable, deleteButton)

        UIRenderable.visible[deleteButton] = 1
        UIRenderable.width[deleteButton] = 100
        UIRenderable.height[deleteButton] = 50

        UIPosition.x[deleteButton] = world.renderer.width / 2 + 200
        UIPosition.y[deleteButton] = 115 + i * 100

        UIText.textId[deleteButton] = world.assets.getAssetId('delete_slot')!
        UIText.textSource[deleteButton] = 1

        UIColor.color[deleteButton] = hexColor('#FF0000FF')

        UIButton.foreground[deleteButton] = hexColor('#FFFFFFFF')
        UIButton.foregroundHover[deleteButton] = hexColor('#FFFFA5FF')
        UIButton.foregroundPressed[deleteButton] = hexColor('#FFFF00FF')

        UISelectable.hovered[deleteButton] = 0
        UISelectable.pressed[deleteButton] = 0

        UICallback.onClick[deleteButton] = world.callbacks.registerCallback(() => {
          world.audio.playSound('click_sound')
          window.electron.ipcRenderer.invoke('save:delete', save.slot).then(() => {
            world.scenes.loadScene('saves')
          })
        })
      }

      UIButton.foreground[entity] = hexColor('#FFFFFFFF')
      UIButton.foregroundHover[entity] = hexColor('#FFFFA5FF')
      UIButton.foregroundPressed[entity] = hexColor('#FFFF00FF')

      UISelectable.hovered[entity] = 0
      UISelectable.pressed[entity] = 0
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
