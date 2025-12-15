import { defineComponent, Types } from 'bitecs'

export const UITexture = defineComponent({
  textureId: Types.ui16,
  textureSizeX: Types.f32,
  textureSizeY: Types.f32,
  textureOffsetX: Types.f32,
  textureOffsetY: Types.f32
})
