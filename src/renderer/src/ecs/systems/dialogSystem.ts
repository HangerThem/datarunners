import type { ExtendedWorld } from '../world'
import { Dialog, DialogText } from '../components/dialog'
import { defineQuery } from 'bitecs'
import { getCurrentLineText } from '../../utils/text'
import { System } from './system'
import { getKeyId } from '../../utils/key'

export class DialogSystem implements System {
  private query = defineQuery([Dialog, DialogText])

  update(world: ExtendedWorld, dt: number): ExtendedWorld {
    return this.updateDialog(world, dt)
  }

  private updateDialog(world: ExtendedWorld, dt: number): ExtendedWorld {
    const currentDialog = this.query(world).find((eid) => Dialog.active[eid] === 1)

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

    if (input.keysPressed[getKeyId('Space')]) {
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
}
