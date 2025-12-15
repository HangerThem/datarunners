import { defineComponent, Types } from 'bitecs'

export const UIFont = defineComponent({
  fontSize: Types.ui16,
  fontFamilyId: Types.ui16,
  color: Types.ui32
})
