import { Types, defineComponent } from 'bitecs'

export const Dialog = defineComponent({
  active: Types.ui8,
  currentLine: Types.ui16,
  totalLines: Types.ui16,
  textId: Types.ui16
})

export const DialogText = defineComponent({
  text: Types.ui8,
  currentChar: Types.ui16,
  charDelay: Types.f32
})
