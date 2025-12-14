import { world } from '../ecs/world'

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

export function getCharFromKeyId(keyId: number): string | null {
  const code = getKeyCode(keyId)
  if (!code) return null

  if (code.startsWith('Key') && code.length === 4) {
    const char = code.charAt(3)
    if (
      world.input.keysDown[getKeyId('ShiftLeft')] ||
      world.input.keysDown[getKeyId('ShiftRight')]
    ) {
      return char.toUpperCase()
    }
    return char.toLowerCase()
  }

  if (code.startsWith('Digit') && code.length === 6) {
    return code.charAt(5)
  }

  if (code.startsWith('Numpad') && code.length === 7) {
    return code.charAt(6)
  }

  const specialChars: Record<string, string> = {
    Space: ' ',
    Period: '.',
    Comma: ',',
    Slash: '/',
    Backslash: '\\',
    BracketLeft: '[',
    BracketRight: ']',
    Semicolon: ';',
    Quote: "'",
    Backquote: '`',
    Minus: '-',
    Equal: '=',
    NumpadAdd: '+',
    NumpadSubtract: '-',
    NumpadMultiply: '*',
    NumpadDivide: '/',
    NumpadDecimal: '.'
  }

  return specialChars[code] ?? null
}

export function mouseButtonToCode(button: number): string | undefined {
  if (button === 0) return 'MouseLeft'
  if (button === 1) return 'MouseMiddle'
  if (button === 2) return 'MouseRight'

  return undefined
}
