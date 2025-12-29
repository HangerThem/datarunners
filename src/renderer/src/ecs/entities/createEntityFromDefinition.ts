import { UIButtonSchema } from '../../types/button.types'
import { UICheckboxSchema } from '../../types/checkbox.types'
import { UIDropdownSchema } from '../../types/dropdown.types'
import { UIRangeSchema } from '../../types/range.types'
import { UITextInputSchema } from '../../types/textInput.types'
import { createButtonEntity } from './button'
import { createCheckboxEntity } from './checkbox'
import { createDropdownEntity } from './dropdown'
import { createRangeEntity } from './range'
import { createTextInputEntity } from './textInput'

type EntityDefinition = {
  type: 'button' | 'checkbox' | 'dropdown' | 'range' | 'textInput'
  data: any
}

export function createEntityFromDefinition(def: EntityDefinition): number {
  switch (def.type) {
    case 'button': {
      const buttonEntity = UIButtonSchema.safeDecode(def.data)

      if (!buttonEntity.success) {
        throw new Error(`Invalid button entity definition: ${buttonEntity.error.message}`)
      }

      return createButtonEntity(buttonEntity.data)
    }
    case 'checkbox': {
      const checkboxEntity = UICheckboxSchema.safeDecode(def.data)

      if (!checkboxEntity.success) {
        throw new Error(`Invalid checkbox entity definition: ${checkboxEntity.error.message}`)
      }

      return createCheckboxEntity(checkboxEntity.data)
    }
    case 'dropdown': {
      const dropdownEntity = UIDropdownSchema.safeDecode(def.data)

      if (!dropdownEntity.success) {
        throw new Error(`Invalid dropdown entity definition: ${dropdownEntity.error.message}`)
      }

      return createDropdownEntity(dropdownEntity.data)
    }
    case 'range': {
      const rangeEntity = UIRangeSchema.safeDecode(def.data)

      if (!rangeEntity.success) {
        throw new Error(`Invalid range entity definition: ${rangeEntity.error.message}`)
      }

      return createRangeEntity(rangeEntity.data)
    }
    case 'textInput': {
      const textInputEntity = UITextInputSchema.safeDecode(def.data)

      if (!textInputEntity.success) {
        throw new Error(`Invalid text input entity definition: ${textInputEntity.error.message}`)
      }

      return createTextInputEntity(textInputEntity.data)
    }
    default:
      throw new Error(`Unknown entity type: ${def.type}`)
  }
}
