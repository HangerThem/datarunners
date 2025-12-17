import { defineComponent, Types } from 'bitecs'

export const UITextInput = defineComponent({
  cursor: Types.ui16,
  maxLength: Types.ui16,
  focused: Types.ui8,
  numeric: Types.ui8,
  textId: Types.ui32
})
