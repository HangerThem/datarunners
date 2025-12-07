import { defineComponent, Types } from 'bitecs'

export const UIButton = defineComponent({
  textureId: Types.ui32,
  textureSizeX: Types.f32,
  textureSizeY: Types.f32,
  textureOffsetX: Types.f32,
  textureOffsetY: Types.f32,
  foreground: Types.ui32,
  foregroundHover: Types.ui32,
  foregroundPressed: Types.ui32,
  hovered: Types.ui8,
  pressed: Types.ui8
})
