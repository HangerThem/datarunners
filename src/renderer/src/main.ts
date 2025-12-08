import { world } from './ecs/world'
import { LoadingScene } from './scenes/LoadingScene'
import { MainMenuScene } from './scenes/MainMenuScene'
import { SettingsScene } from './scenes/SettingsScene'

let last = performance.now()

function startGameLoop(): void {
  function tick(): void {
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

  await world.scenes.loadScene('loading')

  world.scenes.getCurrentScene()!.update(0)

  await new Promise((resolve) => setTimeout(resolve, 500))

  await world.scenes.loadScene('main_menu')

  startGameLoop()
}
