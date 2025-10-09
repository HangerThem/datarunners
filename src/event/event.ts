import type { Game } from "../game.js"
import { ResourceKey } from "../inventory/resources.js"
import { ItemName } from "../items/itemFactory.js"

export interface EventChoice {
  text: string
  outcome: string
  risk?: number
  cost?: {
    items?: Partial<Record<ItemName, number>>
    resources?: Partial<Record<ResourceKey, number>>
  }
  reward?: () => void
  itemRef?: any
  isPossible?: boolean
}

export class Event {
  title: string
  description: string
  choices: EventChoice[]
  private game: Game

  constructor(
    title: string,
    description: string,
    choices: EventChoice[],
    game: Game
  ) {
    this.title = title
    this.description = description
    this.choices = choices
    this.game = game ?? null
  }

  present() {
    this.game.chiptune.playTrack("encounter")
    this.game.gameState.currentEvent = this
    this.game.gameState.awaitingChoice = true

    this.game.addText("", "gameText")
    this.game.addText(`*** ${this.title} ***`, "gameText", "warning-text")
    this.game.addText(this.description, "gameText")
    this.game.addText("", "gameText")
    this.game.addText("What do you do?", "gameText")

    const builtChoices: EventChoice[] = this.choices.map(
      (choice: EventChoice) => {
        const isPossible = !choice.cost
          ? true
          : Object.entries(choice.cost).every(([key, amount]) => {
              switch (key) {
                case "items":
                  return this.game.gameState.inventory.canAfford(
                    amount as Partial<Record<ItemName, number>>
                  )
                case "resources":
                  return this.game.gameState.resources.canAfford(
                    amount as Partial<Record<ResourceKey, number>>
                  )
                default:
                  console.warn(`Unknown cost type: ${key}`)
                  return false
              }
            })

        console.log("Choice:", choice.text, "Possible:", isPossible)

        return { ...choice, isPossible }
      }
    )

    builtChoices.forEach((choice, index) => {
      if (!choice.isPossible) {
        this.game.addText(
          `${index + 1}. ${choice.text} (Insufficient resources)`,
          "gameText",
          "menu-option disabled-text"
        )
      } else {
        this.game.addText(
          `${index + 1}. ${choice.text}`,
          "gameText",
          "menu-option"
        )
      }
    })

    this.game.gameState.choiceOptions = builtChoices
  }
}
