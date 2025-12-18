import { UIDropdownOptionType } from '../types/dropdown.types'

export enum Difficulty {
  Story = 'story',
  Normal = 'normal',
  Survival = 'survival',
  Nightmare = 'nightmare'
}
export const DifficultyOptions: UIDropdownOptionType[] = [
  { label: 'Story', value: Difficulty.Story },
  { label: 'Normal', value: Difficulty.Normal },
  { label: 'Survival', value: Difficulty.Survival },
  { label: 'Nightmare', value: Difficulty.Nightmare }
]
