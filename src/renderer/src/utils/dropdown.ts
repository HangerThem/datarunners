import { UIDropdownOptionType } from '../types/dropdown.types'

const dropdownOptions = new Map<number, UIDropdownOptionType[]>()

export function setDropdownOptions(entity: number, options: UIDropdownOptionType[]): void {
  dropdownOptions.set(entity, options)
}

export function getDropdownOptions(entity: number): UIDropdownOptionType[] | undefined {
  return dropdownOptions.get(entity)
}

export function removeDropdownOptions(entity: number): void {
  dropdownOptions.delete(entity)
}
