import { Game, GameState, getGameInstance } from "../game.js"

export enum GameItemType {
  Consumable = "consumable",
  Equipment = "equipment",
  Misc = "misc",
}

export abstract class GameItem {
  name: string
  type: GameItemType
  description: string
  protected game: Game

  constructor(name: string, type: GameItemType, description: string) {
    this.name = name
    this.type = type
    this.description = description
    this.game = getGameInstance()
  }

  protected log(message: string, style: string = "gameText", variant?: string) {
    this.game.addText(message, style, variant)
  }
}

export abstract class UsableGameItem extends GameItem {
  protected gameState: GameState

  constructor(
    name: string,
    type: GameItemType,
    description: string,
    gameState: GameState
  ) {
    super(name, type, description)
    this.gameState = gameState
  }

  abstract use(): boolean
}
