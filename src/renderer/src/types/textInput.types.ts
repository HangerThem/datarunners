import { z } from 'zod'
import { world } from '../ecs/world'
import { hexColor, validateColor } from '../utils/colors'
import { isValidStringHandle } from '../utils/stringAllocator'

export const UITextInputSchema = z.object({
  labelId: z
    .number()
    .min(0, 'Text ID must be a valid asset ID')
    .refine((id) => world.assets.isValidAsset(id, 'text'), {
      error: 'Text ID must refer to a valid text asset'
    }),
  x: z.number(),
  y: z.number(),
  width: z.number().min(1, 'Width must be at least 1').default(20),
  height: z.number().min(1, 'Height must be at least 1').default(20),
  callbackId: z
    .number()
    .min(0, 'Callback ID must be a valid callback ID')
    .refine(world.callbacks.isValidCallback, {
      error: 'Callback ID must refer to a registered callback'
    }),
  textId: z.number().min(0, 'Text ID must be a valid asset ID').refine(isValidStringHandle, {
    error: 'Text ID must refer to a valid text asset'
  }),
  focused: z.boolean().default(false),
  maxLength: z.number().min(1, 'Max length must be at least 1').optional().default(255),
  numeric: z.boolean().default(false),
  fontSize: z.number().min(1, 'Font size must be at least 1').optional().default(16),
  fontFamilyId: z
    .number()
    .refine((id) => world.assets.isValidAsset(id, 'font'), {
      error: 'Font ID must be a valid asset ID'
    })
    .optional()
    .default(() => world.assets.getDefaultFont()),
  color: z
    .number()
    .refine(validateColor, { error: 'Color must be a valid RGBA color' })
    .optional()
    .default(hexColor('#000000ff')),
  text: z.string().default('')
})

export type UITextInputType = z.infer<typeof UITextInputSchema>
