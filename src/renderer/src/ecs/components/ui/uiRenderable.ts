import { defineComponent, Types } from 'bitecs'

export const UIRenderable = defineComponent({
  width: Types.f32,
  height: Types.f32,
  visible: Types.ui8
})
