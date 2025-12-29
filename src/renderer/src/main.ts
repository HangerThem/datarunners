import { world } from './ecs/world'
import { LoadingScene } from './scenes/LoadingScene'
import { MainMenuScene } from './scenes/MainMenuScene'
import { NewGameScene } from './scenes/NewGameScene'
import { SavesScene } from './scenes/SavesScene'
import { SettingsScene } from './scenes/SettingsScene'

enum Mode {
  EDITOR,
  GAME
}

let mode: Mode = Mode.GAME

export function isEditorMode(): boolean {
  return mode === Mode.EDITOR
}

export function setEditorMode(): void {
  mode = Mode.EDITOR
}

export function setGameMode(): void {
  mode = Mode.GAME
}

let selectedEntityId: number | null = null

export function getSelectedEntityId(): number | null {
  return selectedEntityId
}

export function setSelectedEntityId(entityId: number | null): void {
  selectedEntityId = entityId
}

let last = performance.now()

function startGameLoop(): void {
  function tick(): void {
    if (isEditorMode()) {
      document.body.classList.add('editor-mode')
    } else {
      document.body.classList.remove('editor-mode')
    }

    const now = performance.now()
    const dt = now - last
    last = now

    if (dt < 100) {
      world.scenes.getCurrentScene()!.update(dt)
    }

    requestAnimationFrame(tick)
  }

  tick()
}

export async function initGameEngine(): Promise<void> {
  world.scenes.registerScene('loading', new LoadingScene())
  world.scenes.registerScene('main_menu', new MainMenuScene())
  world.scenes.registerScene('settings', new SettingsScene())
  world.scenes.registerScene('saves', new SavesScene())
  world.scenes.registerScene('new_game', new NewGameScene())

  await world.scenes.loadScene('loading')

  world.scenes.getCurrentScene()!.update(0)

  await world.scenes.loadScene('main_menu')

  startGameLoop()
}
