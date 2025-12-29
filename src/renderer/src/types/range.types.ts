import { z } from 'zod'
import { world } from '../ecs/world'

export const UIRangeSchema = z.object({
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
  callbackId: z
    .number()
    .min(0, 'Callback ID must be a valid callback ID')
    .refine(
      (id) => {
        return world.callbacks.isValidCallback(id)
      },
      { message: 'Callback ID must refer to a registered callback' }
    ),
  value: z.number().default(0),
  min: z.number().default(0),
  max: z.number().default(100),
  step: z.number().min(0.0001, 'Step must be greater than 0').default(1)
})

export type UIRangeType = z.infer<typeof UIRangeSchema>
