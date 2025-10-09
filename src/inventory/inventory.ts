import { Game } from "../game.js"
import { GameItem, UsableGameItem } from "../items/gameItem.js"
import { ItemName } from "../items/itemFactory.js"
import { Slugify } from "../utils/slugify.js"

export interface InventoryEntry {
  item: GameItem
  quantity: number
}

export class Inventory {
  private items: InventoryEntry[] = []
  private game: Game

  constructor(game: Game) {
    this.game = game
  }

  addItem(item: GameItem, quantity: number = 1): void {
    const entry = this.items.find((e) => e.item.name === item.name)
    if (entry) {
      entry.quantity += quantity
    } else {
      this.items.push({ item, quantity })
    }
  }

  itemSelect() {
    const usableEntries = this.items
      .map((entry, idx) => ({ entry, idx }))
      .filter(({ entry }) => this.isUsable(entry.item))

    if (usableEntries.length === 0) {
      this.game.addText(
        "No usable items in inventory.",
        "gameText",
        "error-text"
      )
      return
    }

    this.game.addText("Select an item to use:", "gameText")
    usableEntries.forEach(({ entry }, menuIndex) => {
      this.game.addText(
        `${menuIndex + 1}. ${entry.item.name} (${entry.quantity}) - ${
          entry.item.description
        }`,
        "gameText",
        "menu-option"
      )
    })
    this.game.addText(
      `${usableEntries.length + 1}. Cancel`,
      "gameText",
      "menu-option"
    )

    const exitOption = {
      text: "Cancel",
      outcome: "cancel",
      possible: true,
    }

    this.game.gameState.awaitingChoice = true
    this.game.gameState.choiceOptions = [
      usableEntries.map(({ entry }) => ({
        text: entry.item.name,
        outcome: "use_item",
        itemRef: entry,
        possible: true,
      })),
      exitOption,
    ].flat()
  }

  useItem(entry: InventoryEntry, quantity: number = 1): boolean {
    if (!entry) {
      this.game.addText("No item selected.", "gameText", "error-text")
      return false
    }

    if (!this.isUsable(entry.item)) {
      this.game.addText(
        `${entry.item.name} cannot be used directly.`,
        "gameText",
        "error-text"
      )
      return false
    }

    if (entry.quantity <= 0) return false
    if (quantity && entry.quantity < quantity) return false

    if (this.isUsable(entry.item)) {
      if (entry.item.use()) {
        entry.quantity -= quantity
      } else {
        return false
      }
    } else {
      entry.quantity -= quantity
    }

    if (entry.quantity === 0) {
      const index = this.items.indexOf(entry)
      if (index > -1) {
        this.items.splice(index, 1)
      }
    }

    return true
  }

  removeItem(name: string, quantity: number = 1): boolean {
    const entryIndex = this.items.findIndex(
      (e) => Slugify(e.item.name) === Slugify(name)
    )
    if (entryIndex === -1) return false
    const entry = this.items[entryIndex]
    if (entry.quantity < quantity) return false
    entry.quantity -= quantity
    if (entry.quantity === 0) this.items.splice(entryIndex, 1)
    return true
  }

  getItemQuantity(name: string): number {
    const entry = this.items.find((e) => Slugify(e.item.name) === Slugify(name))
    return entry ? entry.quantity : 0
  }

  isUsable(item: GameItem): item is UsableGameItem {
    return "use" in item && typeof item.use === "function"
  }

  canAfford(cost: Partial<Record<ItemName, number>>): boolean {
    return Object.entries(cost).every(([key, amount]) => {
      const entry = this.items.find(
        (e) => Slugify(e.item.name) === Slugify(key)
      )
      return entry ? entry.quantity >= amount : false
    })
  }

  listItems(): string[][] {
    if (this.items.length === 0) return [[]]
    return this.items.map((entry) => [
      entry.item.name,
      entry.quantity.toString(),
      entry.item.description,
    ])
  }

  showInventory() {
    this.game.displayTable(
      ["Item", "Quantity", "Description"],
      this.listItems(),
      "gameText"
    )
  }

  getItems(): InventoryEntry[] {
    return [...this.items]
  }
}
