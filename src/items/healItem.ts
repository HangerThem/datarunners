import { GameState } from "../game.js"
import { GameItemType, UsableGameItem } from "./gameItem.js"

class HealItem extends UsableGameItem {
  healingAmount: number

  constructor(name: string, healingAmount: number, gameState: GameState) {
    super(
      name,
      GameItemType.Consumable,
      `Restores ${healingAmount} health points to a team member.`,
      gameState
    )
    this.healingAmount = healingAmount
  }

  use() {
    const injuredMembers = this.gameState.teamMembers.filter(
      (m) => m.health < 100
    )

    if (injuredMembers.length === 0) {
      this.log("No team members need healing.", "gameText", "error-text")
      return false
    }

    const memberToHeal = injuredMembers.sort((a, b) => a.health - b.health)[0]

    memberToHeal.heal(this.healingAmount)
    this.log(
      `${memberToHeal.name} healed by ${this.healingAmount} points. Current health: ${memberToHeal.health}.`,
      "gameText",
      "success-text"
    )

    return true
  }
}

export class Bandage extends HealItem {
  static readonly HEALING_AMOUNT = 15
  constructor(gameState: GameState) {
    super("Bandage", Bandage.HEALING_AMOUNT, gameState)
  }
}

export class Medkit extends HealItem {
  static readonly HEALING_AMOUNT = 40
  constructor(gameState: GameState) {
    super("Medkit", Medkit.HEALING_AMOUNT, gameState)
  }
}

export class AdvancedMedkit extends HealItem {
  static readonly HEALING_AMOUNT = 70
  constructor(gameState: GameState) {
    super("Advanced Medkit", AdvancedMedkit.HEALING_AMOUNT, gameState)
  }
}
