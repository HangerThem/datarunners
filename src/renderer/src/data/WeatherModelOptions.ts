import { UIDropdownOptionType } from '../types/dropdown.types'

export enum WeatherModel {
  Standard = 'standard',
  HarshWinter = 'harsh_winter',
  Monsoon = 'monsoon'
}
export const WeatherModelOptions: UIDropdownOptionType[] = [
  { label: 'Standard', value: WeatherModel.Standard },
  { label: 'Harsh Winter', value: WeatherModel.HarshWinter },
  { label: 'Monsoon', value: WeatherModel.Monsoon }
]
