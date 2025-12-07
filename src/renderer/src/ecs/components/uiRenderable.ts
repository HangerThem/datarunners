import { defineComponent, Types } from 'bitecs'

export const UIRenderable = defineComponent({
  visible: Types.ui8,
  textId: Types.ui16
})
