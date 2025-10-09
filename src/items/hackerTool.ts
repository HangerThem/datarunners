import { GameItem, GameItemType } from "./gameItem.js"

export class HackerTool extends GameItem {
  constructor() {
    super(
      "Hacker Tool",
      GameItemType.Equipment,
      "A versatile tool used by hackers to bypass security systems and gain unauthorized access."
    )
  }
}
