import { createWorld, type IWorld } from 'bitecs'
import { AssetsManager } from './assetsManager'
import type { Item } from './item'
import { CallbackManager } from './callbackManager'
import { CursorType } from '../types/cursor'
import { AudioManager } from './audioManager'

export interface InputResource {
  keysDown: Uint8Array
  keysPressed: Uint8Array
  keysReleased: Uint8Array
  holdTimes: Float32Array
}

export interface MousePosition {
  x: number
  y: number
}

export interface InventoryResource {
  [entityId: number]: {
    items: (Item | null)[]
    activeSlot: number
  }
}

export interface RendererResource {
  ctx: CanvasRenderingContext2D
  width: number
  height: number
}

export interface ExtendedWorld extends IWorld {
  input: InputResource
  mousePosition: MousePosition
  inventory: InventoryResource
  renderer: RendererResource
  assets: AssetsManager
  audio: AudioManager
  callbacks: CallbackManager
  cursor: CursorType
}

export const world: ExtendedWorld = createWorld() as ExtendedWorld

export const KeyCode = {
  MouseLeft: 0,
  MouseRight: 1,
  KeyW: 2,
  KeyA: 3,
  KeyS: 4,
  KeyD: 5,
  KeyE: 6,
  Space: 7,
  Shift: 8,
  Tab: 9
}

export const KEY_COUNT = Object.keys(KeyCode).length

world.input = {
  keysDown: new Uint8Array(KEY_COUNT),
  keysPressed: new Uint8Array(KEY_COUNT),
  keysReleased: new Uint8Array(KEY_COUNT),
  holdTimes: new Float32Array(KEY_COUNT)
}
world.mousePosition = { x: 0, y: 0 }

world.inventory = {}
world.assets = new AssetsManager()
world.audio = new AudioManager(world.assets)
world.callbacks = new CallbackManager()

const canvas = document.createElement('canvas')
canvas.width = window.innerWidth
canvas.height = window.innerHeight
document.body.appendChild(canvas)

world.renderer = {
  ctx: canvas.getContext('2d')!,
  width: canvas.width,
  height: canvas.height
}

world.cursor = 'default'

window.addEventListener('resize', () => {
  canvas.width = window.innerWidth
  canvas.height = window.innerHeight
  world.renderer.width = canvas.width
  world.renderer.height = canvas.height
})

window.addEventListener('keydown', (e) => {
  e.preventDefault()
  e.stopPropagation()
  e.stopImmediatePropagation()

  const code = KeyCode[e.code]
  if (code !== undefined && !world.input.keysDown[code]) {
    world.input.keysDown[code] = 1
    world.input.keysPressed[code] = 1
  }
})

window.addEventListener('keyup', (e) => {
  e.preventDefault()
  e.stopPropagation()
  e.stopImmediatePropagation()

  const code = KeyCode[e.code]
  if (code !== undefined && world.input.keysDown[code]) {
    world.input.keysDown[code] = 0
    world.input.keysReleased[code] = 1
    world.input.holdTimes[code] = 0
  }
})

window.addEventListener('blur', () => {
  for (let i = 0; i < KEY_COUNT; i++) {
    world.input.keysDown[i] = 0
    world.input.keysReleased[i] = 1
    world.input.holdTimes[i] = 0
  }
})

// window.addEventListener("contextmenu", (e) => {
//   e.preventDefault()
//   e.stopPropagation()
//   e.stopImmediatePropagation()
// })

window.addEventListener('mousedown', (e) => {
  e.preventDefault()
  e.stopPropagation()
  e.stopImmediatePropagation()

  let code: number | undefined
  if (e.button === 0) {
    code = KeyCode.MouseLeft
  } else if (e.button === 2) {
    code = KeyCode.MouseRight
  }

  if (code !== undefined && !world.input.keysDown[code]) {
    world.input.keysDown[code] = 1
    world.input.keysPressed[code] = 1
  }
})

window.addEventListener('mouseup', (e) => {
  e.preventDefault()
  e.stopPropagation()
  e.stopImmediatePropagation()

  let code: number | undefined
  if (e.button === 0) {
    code = KeyCode.MouseLeft
  } else if (e.button === 2) {
    code = KeyCode.MouseRight
  }

  if (code !== undefined && world.input.keysDown[code]) {
    world.input.keysDown[code] = 0
    world.input.keysReleased[code] = 1
    world.input.holdTimes[code] = 0
  }
})

window.addEventListener('mousemove', (e) => {
  world.mousePosition = {
    x: e.clientX,
    y: e.clientY
  }
})
