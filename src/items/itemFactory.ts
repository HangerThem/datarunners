import { GameState } from "../game.js"
import { GameItem, UsableGameItem } from "./gameItem.js"
import {
  SmallEnergyCell,
  LargeEnergyCell,
  AdvancedEnergyCell,
} from "./energyItem.js"
import { AdvancedMedkit, Bandage, Medkit } from "./healItem.js"
import { Jammer } from "./jammer.js"
import { HackerTool } from "./hackerTool.js"

const ITEM_REGISTRY = {
  Bandage,
  Medkit,
  AdvancedMedkit,
  SmallEnergyCell,
  LargeEnergyCell,
  AdvancedEnergyCell,
  Jammer,
  HackerTool,
} as const

export type ItemName = keyof typeof ITEM_REGISTRY

export function createItem(
  name: ItemName,
  gameState: GameState
): UsableGameItem | GameItem {
  const ItemClass = ITEM_REGISTRY[name]
  if (!ItemClass) {
    throw new Error(`Item "${name}" not found in registry.`)
  }

  return new ItemClass(gameState)
}
