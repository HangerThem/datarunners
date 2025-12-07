import { world } from './ecs/world'
import { updateGame } from './loop'
import { registerEntities } from './ecs/entities/registerEntities'
import { addComponent, addEntity, removeEntity } from 'bitecs'
import { UIRenderable } from './ecs/components/uiRenderable'
import { UIPosition } from './ecs/components/uiPosition'

let last = performance.now()

function startGameLoop(): void {
  function tick(): void {
    const now = performance.now()
    const dt = now - last
    last = now

    if (dt < 100) {
      updateGame(world, dt)
    }

    requestAnimationFrame(tick)
  }

  tick()
}

export async function initGameEngine(): Promise<void> {
  const loading = addEntity(world)

  addComponent(world, UIRenderable, loading)
  addComponent(world, UIPosition, loading)

  UIRenderable.textId[loading] = world.assets.addTextAsset('loading_text', 'Loading...')
  UIRenderable.visible[loading] = 1

  UIPosition.x[loading] = world.renderer.width / 2 - 100
  UIPosition.y[loading] = world.renderer.height / 2 - 25
  UIPosition.width[loading] = 200
  UIPosition.height[loading] = 50

  updateGame(world, 0)

  await world.assets.loadImages([{ name: 'button_atlas', src: 'assets/ui/button_atlas.png' }])

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

  removeEntity(world, loading)

  startGameLoop()
}
