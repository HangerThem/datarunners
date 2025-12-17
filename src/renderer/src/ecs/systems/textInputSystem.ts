import { defineQuery } from 'bitecs'
import { UITextInput } from '../components/ui/uiTextInput'
import { ExtendedWorld } from '../world'
import { System } from './system'
import { editString, getString } from '../../utils/stringAllocator'
import { getKeyId, isKeyActivated } from '../../utils/key'

export class TextInputSystem implements System {
  private textInputQuery = defineQuery([UITextInput])

  update(world: ExtendedWorld, dt: number): ExtendedWorld {
    return this.updateTextInput(world, dt)
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private updateTextInput(world: ExtendedWorld, _dt: number): ExtendedWorld {
    const ents = this.textInputQuery(world)
    for (const e of ents) {
      if (!UITextInput.focused[e]) continue

      const id = UITextInput.textId[e]
      let text = getString(id)

      for (const char of world.input.textInputBuffer) {
        if (char && text.length < UITextInput.maxLength[e]) {
          if (UITextInput.numeric[e] && (isNaN(Number(char)) || char === ' ')) {
            continue
          }
          const cursorPos = UITextInput.cursor[e]
          text = text.slice(0, cursorPos) + char + text.slice(cursorPos)
          UITextInput.cursor[e]++
        }
      }

      if (isKeyActivated(getKeyId('Backspace')) && text.length > 0) {
        const cursorPos = UITextInput.cursor[e]
        if (cursorPos === 0) continue
        text = text.slice(0, cursorPos - 1) + text.slice(cursorPos)
        UITextInput.cursor[e] = Math.max(0, cursorPos - 1)
      } else if (isKeyActivated(getKeyId('Delete')) && text.length > 0) {
        const cursorPos = UITextInput.cursor[e]
        text = text.slice(0, cursorPos) + text.slice(cursorPos + 1)
      }

      if (isKeyActivated(getKeyId('ArrowLeft'))) {
        UITextInput.cursor[e] = Math.max(0, UITextInput.cursor[e] - 1)
      } else if (isKeyActivated(getKeyId('ArrowRight'))) {
        UITextInput.cursor[e] = Math.min(text.length, UITextInput.cursor[e] + 1)
      }

      editString(id, text)
    }

    return world
  }
}
