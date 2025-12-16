import { z } from 'zod'
import { validateColor } from '../utils/colors'

export const UIButtonSchema = z
  .object({
    textId: z.number().min(0, 'Text ID must be a valid asset ID'),
    x: z.number(),
    y: z.number(),
    scale: z.number().default(1),
    textureId: z.number().min(0, 'Texture ID must be a valid asset ID'),
    textureSizeX: z.number(),
    textureSizeY: z.number(),
    textureOffsetX: z.number().default(0),
    textureOffsetY: z.number().default(0),
    foregroundColor: z
      .number()
      .refine(validateColor, { message: 'Foreground color must be a valid RGBA color' }),
    hoverForegroundColor: z
      .number()
      .refine(validateColor, { message: 'Hover foreground color must be a valid RGBA color' })
      .optional(),
    pressedForegroundColor: z
      .number()
      .refine(validateColor, { message: 'Pressed foreground color must be a valid RGBA color' })
      .optional(),
    callbackId: z.number().min(0, 'Callback ID must be a valid callback ID')
  })
  .transform((data) => ({
    ...data,
    hoverForegroundColor: data.hoverForegroundColor ?? data.foregroundColor,
    pressedForegroundColor: data.pressedForegroundColor ?? data.foregroundColor
  }))

export type UIButtonType = z.infer<typeof UIButtonSchema>
