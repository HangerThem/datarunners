import { z } from 'zod'
import { world } from '../ecs/world'

export const UICheckboxSchema = z.object({
  labelId: z
    .number()
    .min(0, 'Text ID must be a valid asset ID')
    .refine((id) => world.assets.isValidAsset(id, 'text'), {
      message: 'Text ID must refer to a valid text asset'
    }),
  x: z.number(),
  y: z.number(),
  width: z.number().min(1, 'Width must be at least 1').default(20),
  height: z.number().min(1, 'Height must be at least 1').default(20),
  textureId: z
    .number()
    .min(0, 'Texture ID must be a valid asset ID')
    .refine((id) => world.assets.isValidAsset(id, 'image'), {
      message: 'Texture ID must refer to a valid image asset'
    }),
  textureSizeX: z.number().default(100),
  textureSizeY: z.number().default(100),
  textureOffsetX: z.number().default(0),
  textureOffsetY: z.number().default(0),
  callbackId: z
    .number()
    .min(0, 'Callback ID must be a valid callback ID')
    .refine(
      (id) => {
        return world.callbacks.isValidCallback(id)
      },
      { message: 'Callback ID must refer to a registered callback' }
    ),
  checked: z.boolean().default(false),
  groupId: z.number().min(0, 'Group ID must be a valid group ID').optional()
})

export type UICheckboxType = z.infer<typeof UICheckboxSchema>
