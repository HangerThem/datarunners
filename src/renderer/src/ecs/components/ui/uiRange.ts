import { defineComponent, Types } from 'bitecs'

export const UIRange = defineComponent({
  value: Types.f32,
  min: Types.f32,
  max: Types.f32,
  step: Types.f32
})
