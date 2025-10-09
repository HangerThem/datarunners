export type ResourceKey = keyof Resources

export class Resources {
  credits: number
  data: number
  energy: number

  constructor(credits: number = 500, data: number = 50, energy: number = 100) {
    this.credits = credits
    this.data = data
    this.energy = energy
  }

  canAfford(cost: Partial<Record<ResourceKey, number>>): boolean {
    if (cost.credits && this.credits < cost.credits) return false
    if (cost.data && this.data < cost.data) return false
    if (cost.energy && this.energy < cost.energy) return false
    return true
  }

  pay(cost: Partial<Record<ResourceKey, number>>): boolean {
    if (!this.canAfford(cost)) return false
    if (cost.credits) this.credits -= cost.credits
    if (cost.data) this.data -= cost.data
    if (cost.energy) this.energy -= cost.energy
    return true
  }

  earn(reward: Partial<Record<ResourceKey, number>>) {
    if (reward.credits) this.credits += reward.credits
    if (reward.data) this.data += reward.data
    if (reward.energy) this.energy += reward.energy
  }
}
