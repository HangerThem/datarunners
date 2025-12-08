import { defineComponent, Types } from 'bitecs'

export const UICheckbox = defineComponent({
  hovered: Types.ui8,
  pressed: Types.ui8,
  checked: Types.ui8
})
