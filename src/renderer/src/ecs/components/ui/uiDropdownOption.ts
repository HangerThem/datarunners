import { defineComponent, Types } from 'bitecs'

export const UIDropdownOption = defineComponent({
  optionIndex: Types.ui16,
  parentDropdown: Types.eid
})
