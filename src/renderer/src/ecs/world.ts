import { createWorld, type IWorld } from 'bitecs'
import { AssetsManager } from '../managers/assetsManager'
import { CallbackManager } from '../managers/callbackManager'
import { AudioManager } from '../managers/audioManager'
import { CursorType } from '../types/cursor'
import { SceneManager } from '../managers/sceneManager'
import { getKeyId, mouseButtonToCode } from '../utils/key'

export interface InputResource {
  keysDown: Uint8Array
  keysPressed: Uint8Array
  keysReleased: Uint8Array
  holdTimes: Float32Array

  activeKeys: Set<number>
  textInputBuffer: string[]
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

const MAX_KEYS = 256

world.input = {
  keysDown: new Uint8Array(MAX_KEYS),
  keysPressed: new Uint8Array(MAX_KEYS),
  keysReleased: new Uint8Array(MAX_KEYS),
  holdTimes: new Float32Array(MAX_KEYS),
  activeKeys: new Set<number>(),
  textInputBuffer: []
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

function preventDefaultHandler(e: Event): void {
  e.preventDefault()
  e.stopPropagation()
  e.stopImmediatePropagation()
}

function keydownHandler(e: KeyboardEvent): void {
  preventDefaultHandler(e)

  const key = getKeyId(e.code)

  if (e.key.length === 1) {
    world.input.textInputBuffer.push(e.key)
  }

  if (!world.input.keysDown[key]) {
    world.input.keysDown[key] = 1
    world.input.keysPressed[key] = 1
    world.input.activeKeys.add(key)
  }
}

function keyupHandler(e: KeyboardEvent): void {
  preventDefaultHandler(e)

  const key = getKeyId(e.code)

  if (world.input.keysDown[key]) {
    world.input.keysDown[key] = 0
    world.input.keysReleased[key] = 1
    world.input.holdTimes[key] = 0
  }
}

function blurHandler(): void {
  world.input.keysDown.fill(0)
  world.input.keysPressed.fill(0)
  world.input.keysReleased.fill(0)
  world.input.holdTimes.fill(0)
  world.input.activeKeys.clear()

  world.cursor = 'default'
  world.mousePosition = { x: -1, y: -1 }
}

function mousedownHandler(e: MouseEvent): void {
  preventDefaultHandler(e)

  const code = mouseButtonToCode(e.button)
  if (!code) return

  const key = getKeyId(code)

  if (!world.input.keysDown[key]) {
    world.input.keysDown[key] = 1
    world.input.keysPressed[key] = 1
    world.input.activeKeys.add(key)
  }
}

function mouseupHandler(e: MouseEvent): void {
  preventDefaultHandler(e)

  const code = mouseButtonToCode(e.button)
  if (!code) return

  const key = getKeyId(code)

  if (world.input.keysDown[key]) {
    world.input.keysDown[key] = 0
    world.input.keysReleased[key] = 1
    world.input.holdTimes[key] = 0
    world.input.activeKeys.add(key)
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
