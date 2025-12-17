import { Scene, SceneAssets } from './Scene'
import { world } from '../ecs/world'
import { RenderSystem } from '../ecs/systems/renderSystem'
import { System } from '../ecs/systems/system'
import { UISystem } from '../ecs/systems/uiSystem'
import { CursorSystem } from '../ecs/systems/cursorSystem'
import { InputSystem } from '../ecs/systems/inputSystem'
import { hexColor } from '../utils/colors'
import { allocString } from '../utils/stringAllocator'
import { UIButtonSchema } from '../types/button.types'
import { createButtonEntity } from '../ecs/entities/button'
import { UIText } from '../ecs/components/ui/uiText'

interface SaveData {
  slot: number
  timestamp: number
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  gameState: any
}

export class SavesScene implements Scene {
  private systems: System[]
  private saveData: SaveData[] | null = null
  private assets: SceneAssets = {
    images: [],
    fonts: [],
    audio: [{ name: 'click_sound', src: 'click.mp3' }],
    texts: [
      {
        name: 'empty_slot',
        src: 'buttons/empty_slot.json'
      },
      {
        name: 'delete_slot',
        src: 'buttons/delete_slot.json'
      }
    ]
  }

  constructor() {
    this.systems = [new UISystem(), new CursorSystem(), new InputSystem(), new RenderSystem()]
  }

  async load(): Promise<void> {
    this.saveData = await window.electron.ipcRenderer.invoke('saves:load')

    if (this.saveData == null) {
      world.scenes.loadScene('main_menu')
      return
    }

    await world.assets.loadSceneAssets(this.assets)

    for (let i = 0; i < 3; i++) {
      if (i >= this.saveData.length!) {
        const newSaveButton = UIButtonSchema.safeDecode({
          textId: world.assets.getAssetId('empty_slot')!,
          x: world.renderer.width / 2 - 225,
          y: 100 + i * 100,
          width: 450,
          height: 80,
          callbackId: world.callbacks.registerCallback(() => {
            world.audio.playSound('click_sound')
            world.scenes.loadScene('new_game')
          })
        })

        if (!newSaveButton.success) {
          console.error('Failed to create new save button:', newSaveButton.error)
          continue
        }

        createButtonEntity(newSaveButton.data)
      } else {
        const save = this.saveData[i]
        const date = new Date(save.timestamp)
        const dateString = date.toLocaleString()

        const existingSaveButton = UIButtonSchema.safeDecode({
          textId: allocString(`Save Slot ${save.slot}\nLast Played: ${dateString}`),
          x: world.renderer.width / 2 - 300,
          y: 100 + i * 100,
          width: 400,
          height: 80,
          backgroundColor: hexColor('#2bba47ff'),
          callbackId: world.callbacks.registerCallback(() => {
            world.audio.playSound('click_sound')
            window.electron.ipcRenderer.invoke('save:load', save.slot).then(() => {
              world.scenes.loadScene('game')
            })
          })
        })

        if (!existingSaveButton.success) {
          console.error('Failed to create existing save button:', existingSaveButton.error)
          continue
        }

        const createButtonId = createButtonEntity(existingSaveButton.data)
        UIText.textSource[createButtonId] = 1

        const deleteButton = UIButtonSchema.safeDecode({
          textId: world.assets.getAssetId('delete_slot')!,
          x: world.renderer.width / 2 + 200,
          y: 115 + i * 100,
          width: 100,
          height: 50,
          backgroundColor: hexColor('#FF0000FF'),
          callbackId: world.callbacks.registerCallback(() => {
            world.audio.playSound('click_sound')
            window.electron.ipcRenderer.invoke('save:delete', save.slot).then(() => {
              world.scenes.loadScene('saves')
            })
          })
        })

        if (!deleteButton.success) {
          console.error('Failed to create delete button:', deleteButton.error)
          continue
        }

        createButtonEntity(deleteButton.data)
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
