import { world } from '../ecs/world'

const KEYPRESS_DELAY_FIRST = 150
const KEYPRESS_DELAY = 100

const keyMap = new Map<string, number>()
const reverseKeyMap = new Map<number, string>()
let nextKeyId = 0

export function getKeyId(code: string): number {
  let id = keyMap.get(code)
  if (id === undefined) {
    id = nextKeyId++
    keyMap.set(code, id)
    reverseKeyMap.set(id, code)
  }
  return id
}

export function getKeyCode(id: number): string | undefined {
  return reverseKeyMap.get(id)
}

export function isKeyActivated(keyId: number): boolean {
  if (
    world.input.keysPressed[keyId] ||
    (world.input.holdTimes[keyId] > KEYPRESS_DELAY_FIRST &&
      world.input.holdTimes[keyId] % KEYPRESS_DELAY < 20)
  ) {
    return true
  }

  return false
}

export function mouseButtonToCode(button: number): string | undefined {
  if (button === 0) return 'MouseLeft'
  if (button === 1) return 'MouseMiddle'
  if (button === 2) return 'MouseRight'

  return undefined
}
