import { GameState } from "../game.js"
import { GameItemType, UsableGameItem } from "./gameItem.js"

class EnergyItem extends UsableGameItem {
  energyAmount: number

  constructor(
    cellConfig: { name: string; energyAmount: number },
    gameState: GameState
  ) {
    super(
      cellConfig.name,
      GameItemType.Consumable,
      `Restores ${cellConfig.energyAmount} energy points to the team.`,
      gameState
    )
    this.energyAmount = cellConfig.energyAmount
  }

  use() {
    return this.game.restoreEnergy(this.energyAmount)
  }
}

export class SmallEnergyCell extends EnergyItem {
  static readonly ENERGY_AMOUNT = 20
  constructor(gameState: GameState) {
    super(
      {
        name: "Small Energy Cell",
        energyAmount: SmallEnergyCell.ENERGY_AMOUNT,
      },
      gameState
    )
  }
}

export class LargeEnergyCell extends EnergyItem {
  static readonly ENERGY_AMOUNT = 30
  constructor(gameState: GameState) {
    super(
      {
        name: "Large Energy Cell",
        energyAmount: LargeEnergyCell.ENERGY_AMOUNT,
      },
      gameState
    )
  }
}

export class AdvancedEnergyCell extends EnergyItem {
  static readonly ENERGY_AMOUNT = 50
  constructor(gameState: GameState) {
    super(
      {
        name: "Advanced Energy Cell",
        energyAmount: AdvancedEnergyCell.ENERGY_AMOUNT,
      },
      gameState
    )
  }
}
