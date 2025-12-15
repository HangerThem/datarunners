import { defineQuery } from 'bitecs'
import { TextInput } from '../components/textInput'
import { UIText } from '../components/ui/uiText'
import { ExtendedWorld } from '../world'
import { System } from './system'
import { editString, getString } from '../../utils/stringAllocator'
import { getKeyId } from '../../utils/key'

export class TextEditSystem implements System {
  private textInputQuery = defineQuery([TextInput, UIText])

  update(world: ExtendedWorld, dt: number): ExtendedWorld {
    return this.updateTextEdit(world, dt)
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private updateTextEdit(world: ExtendedWorld, _dt: number): ExtendedWorld {
    const ents = this.textInputQuery(world)
    for (const e of ents) {
      if (!TextInput.focused[e]) continue

      const id = UIText.textId[e]
      let text = getString(id)

      for (const char of world.input.textInputBuffer) {
        if (char && text.length < TextInput.maxLength[e]) {
          const cursorPos = TextInput.cursor[e]
          text = text.slice(0, cursorPos) + char + text.slice(cursorPos)
          TextInput.cursor[e]++
        }
      }

      if (
        (world.input.keysPressed[getKeyId('Backspace')] ||
          (world.input.holdTimes[getKeyId('Backspace')] > 150 &&
            world.input.holdTimes[getKeyId('Backspace')] % 100 < 20)) &&
        text.length > 0
      ) {
        const cursorPos = TextInput.cursor[e]
        if (cursorPos === 0) continue
        text = text.slice(0, cursorPos - 1) + text.slice(cursorPos)
        TextInput.cursor[e] = Math.max(0, cursorPos - 1)
      } else if (world.input.keysPressed[getKeyId('Delete')] && text.length > 0) {
        const cursorPos = TextInput.cursor[e]
        text = text.slice(0, cursorPos) + text.slice(cursorPos + 1)
      }

      if (
        world.input.keysPressed[getKeyId('ArrowLeft')] ||
        (world.input.holdTimes[getKeyId('ArrowLeft')] > 150 &&
          world.input.holdTimes[getKeyId('ArrowLeft')] % 100 < 20)
      ) {
        TextInput.cursor[e] = Math.max(0, TextInput.cursor[e] - 1)
      } else if (
        world.input.keysPressed[getKeyId('ArrowRight')] ||
        (world.input.holdTimes[getKeyId('ArrowRight')] > 150 &&
          world.input.holdTimes[getKeyId('ArrowRight')] % 100 < 20)
      ) {
        TextInput.cursor[e] = Math.min(text.length, TextInput.cursor[e] + 1)
      }

      editString(id, text)
    }

    return world
  }
}
