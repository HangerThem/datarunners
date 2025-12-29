import { z } from 'zod'
import { hexColor, validateColor } from '../utils/colors'
import { world } from '../ecs/world'

export const UIDropdownOptionSchema = z.object({
  label: z.string(),
  value: z.union([z.string(), z.number()])
})

export type UIDropdownOptionType = z.infer<typeof UIDropdownOptionSchema>

export const UIDropdownSchema = z
  .object({
    labelId: z
      .number()
      .min(0, 'Text ID must be a valid asset ID')
      .refine((id) => world.assets.isValidAsset(id, 'text'), {
        error: 'Text ID must refer to a valid text asset'
      }),
    x: z.number(),
    y: z.number(),
    width: z.number().min(1, 'Width must be at least 1').default(100),
    height: z.number().min(1, 'Height must be at least 1').default(50),
    textureId: z
      .number()
      .min(0, 'Texture ID must be a valid asset ID')
      .optional()
      .refine((id) => id === undefined || world.assets.isValidAsset(id, 'image'), {
        error: 'Texture ID must refer to a valid image asset'
      }),
    textureSizeX: z.number().default(100),
    textureSizeY: z.number().default(100),
    textureOffsetX: z.number().default(0),
    textureOffsetY: z.number().default(0),
    foregroundColor: z
      .number()
      .default(hexColor('#ffffffff'))
      .refine(validateColor, { error: 'Foreground color must be a valid RGBA color' }),
    hoverForegroundColor: z
      .number()
      .refine(validateColor, { error: 'Hover foreground color must be a valid RGBA color' })
      .optional(),
    pressedForegroundColor: z
      .number()
      .refine(validateColor, { error: 'Pressed foreground color must be a valid RGBA color' })
      .optional(),
    backgroundColor: z
      .number()
      .default(hexColor('#858585ff'))
      .refine(validateColor, { error: 'Background color must be a valid RGBA color' }),
    selectedIndex: z.number().min(0, 'Selected index must be at least 0').default(0),
    open: z.boolean().default(false),
    options: z.array(UIDropdownOptionSchema).min(1, 'There must be at least one dropdown option')
  })
  .transform((data) => ({
    ...data,
    hoverForegroundColor: data.hoverForegroundColor ?? data.foregroundColor,
    pressedForegroundColor: data.pressedForegroundColor ?? data.foregroundColor
  }))

export type UIDropdownType = z.infer<typeof UIDropdownSchema>
