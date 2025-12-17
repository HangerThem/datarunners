import { defineComponent, Types } from 'bitecs'

export const UIButton = defineComponent({
  foreground: Types.ui32,
  foregroundHover: Types.ui32,
  foregroundPressed: Types.ui32
})
