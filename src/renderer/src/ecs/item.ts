import type { ExtendedWorld } from './world'

export interface Item {
  id: number
  name: string
  amount?: number
  type: 'weapon' | 'potion' | 'misc'
  sprite: string
}

export function giveItem(world: ExtendedWorld, eid: number, item: Item): boolean {
  const inv = world.inventory[eid]

  for (let i = 0; i < inv.items.length; i++) {
    if (inv.items[i] == null) {
      inv.items[i] = item
      return true
    }
  }

  return false
}

export function decreaseItemAmount(world: ExtendedWorld, eid: number, itemId: number): boolean {
  const inv = world.inventory[eid]

  for (let i = 0; i < inv.items.length; i++) {
    const item = inv.items[i]
    if (item && item.id === itemId) {
      if (item.amount && item.amount > 1) {
        item.amount -= 1
      } else {
        inv.items[i] = null
      }
      return true
    }
  }

  return false
}
