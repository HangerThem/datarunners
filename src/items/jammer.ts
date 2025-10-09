import { GameItem, GameItemType } from "./gameItem.js"

export class Jammer extends GameItem {
  constructor() {
    super(
      "Jammer",
      GameItemType.Equipment,
      "Creates interference to help avoid detection during risky actions."
    )
  }
}
