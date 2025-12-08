import { KeyCode, type ExtendedWorld } from '../world'
import { Dialog, DialogText } from '../components/dialog'
import { defineQuery } from 'bitecs'

const dialogQuery = defineQuery([Dialog])

function getTextLines(world: ExtendedWorld, textId: number): string[] {
  return world.assets.getAssetById<string[]>(textId)!
}

export function getCurrentLineText(world: ExtendedWorld, currentDialog: number): string {
  const textLines = getTextLines(world, Dialog.textId[currentDialog])
  return textLines[Dialog.currentLine[currentDialog]]
}

export function dialogSystem(world: ExtendedWorld, dt: number): ExtendedWorld {
  const currentDialog = dialogQuery(world).find((eid) => Dialog.active[eid] === 1)

  if (currentDialog === undefined) {
    return world
  }

  const input = world.input

  if (DialogText.charDelay[currentDialog] > 25) {
    DialogText.charDelay[currentDialog] = 0
    DialogText.currentChar[currentDialog] += 1
  } else {
    DialogText.charDelay[currentDialog] += dt
  }

  if (input.keysPressed[KeyCode.Space]) {
    if (DialogText.currentChar[currentDialog] < getCurrentLineText(world, currentDialog).length) {
      DialogText.currentChar[currentDialog] = getCurrentLineText(world, currentDialog).length
      return world
    }

    if (Dialog.currentLine[currentDialog] < Dialog.totalLines[currentDialog] - 1) {
      Dialog.currentLine[currentDialog] += 1
      DialogText.currentChar[currentDialog] = 0
    } else {
      Dialog.active[currentDialog] = 0
    }
  }

  return world
}
