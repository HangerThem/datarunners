import { createWorld, type IWorld } from 'bitecs'
import { AssetsManager } from '../managers/assetsManager'
import { CallbackManager } from '../managers/callbackManager'
import { AudioManager } from '../managers/audioManager'
import { CursorType } from '../types/cursor'
import { SceneManager } from '../managers/sceneManager'

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

export interface RendererResource {
  ctx: CanvasRenderingContext2D
  width: number
  height: number
}

export interface ExtendedWorld extends IWorld {
  input: InputResource
  mousePosition: MousePosition
  renderer: RendererResource
  assets: AssetsManager
  audio: AudioManager
  callbacks: CallbackManager
  scenes: SceneManager
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

world.assets = new AssetsManager()
world.audio = new AudioManager(world.assets)
world.callbacks = new CallbackManager()
world.scenes = new SceneManager()

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

function resizeHandler(): void {
  canvas.width = window.innerWidth
  canvas.height = window.innerHeight
  world.renderer.width = canvas.width
  world.renderer.height = canvas.height
}

function keydownHandler(e: KeyboardEvent): void {
  e.preventDefault()
  e.stopPropagation()
  e.stopImmediatePropagation()

  const code = KeyCode[e.code]
  if (code !== undefined && !world.input.keysDown[code]) {
    world.input.keysDown[code] = 1
    world.input.keysPressed[code] = 1
  }
}

function keyupHandler(e: KeyboardEvent): void {
  e.preventDefault()
  e.stopPropagation()
  e.stopImmediatePropagation()

  const code = KeyCode[e.code]
  if (code !== undefined && world.input.keysDown[code]) {
    world.input.keysDown[code] = 0
    world.input.keysReleased[code] = 1
    world.input.holdTimes[code] = 0
  }
}

function blurHandler(): void {
  for (let i = 0; i < KEY_COUNT; i++) {
    world.input.keysDown[i] = 0
    world.input.keysReleased[i] = 1
    world.input.holdTimes[i] = 0
  }

  world.cursor = 'default'
  world.mousePosition = { x: -1, y: -1 }
}

function mousedownHandler(e: MouseEvent): void {
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
}

function mouseupHandler(e: MouseEvent): void {
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
}

function mousemoveHandler(e: MouseEvent): void {
  world.mousePosition = {
    x: e.clientX,
    y: e.clientY
  }
}

window.addEventListener('resize', resizeHandler)
window.addEventListener('keydown', keydownHandler)
window.addEventListener('keyup', keyupHandler)
window.addEventListener('blur', blurHandler)
window.addEventListener('mousedown', mousedownHandler)
window.addEventListener('mouseup', mouseupHandler)
window.addEventListener('mousemove', mousemoveHandler)
