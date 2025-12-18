import { defineComponent, Types } from 'bitecs'

export const UIDropdown = defineComponent({
  selectedIndex: Types.i32,
  open: Types.ui8,
  changed: Types.ui8
})
