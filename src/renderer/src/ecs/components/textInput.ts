import { defineComponent, Types } from 'bitecs'

export const TextInput = defineComponent({
  cursor: Types.ui16,
  maxLength: Types.ui16,
  focused: Types.ui8,
})
