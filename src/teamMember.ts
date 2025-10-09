import { Game } from "./game"

export enum TeamMemberStatus {
  Healthy = "Healthy",
  Injured = "Injured",
  Critical = "Critical",
  Unconscious = "Unconscious",
  Deceased = "Deceased",
}

export class TeamMember {
  private readonly MAX_HEALTH = 100

  name: string
  role: string
  health: number
  status: string
  skills: { [key: string]: number }
  private game: Game

  constructor(
    name: string,
    role: string,
    skills: { [key: string]: number },
    game: Game,
    health: number = this.MAX_HEALTH
  ) {
    this.name = name
    this.role = role
    this.health = health
    this.status = this.updateStatus()
    this.skills = skills
    this.game = game
  }

  updateStatus(): string {
    if (this.health >= 75) {
      this.status = TeamMemberStatus.Healthy
    } else if (this.health >= 50) {
      this.status = TeamMemberStatus.Injured
    } else if (this.health >= 25) {
      this.status = TeamMemberStatus.Critical
      this.game.addText(
        `${this.name} is in critical condition!`,
        "gameText",
        "warning-text"
      )
    } else if (this.health > 0) {
      this.status = TeamMemberStatus.Unconscious
      this.game.addText(
        `${this.name} has fallen unconscious!`,
        "gameText",
        "error-text"
      )
    } else {
      this.status = TeamMemberStatus.Deceased
      this.health = 0
      this.game.addText(`${this.name} has died.`, "gameText", "error-text")
      this.game.checkGameOver()
    }
    return this.status
  }

  receiveDamage(amount: number) {
    this.health -= amount

    this.game.addText(
      `${this.name} takes ${amount} damage!`,
      "gameText",
      "error-text"
    )

    this.updateStatus()
  }

  heal(amount: number) {
    if (this.status !== TeamMemberStatus.Deceased) {
      this.health += amount
      if (this.health > this.MAX_HEALTH) this.health = this.MAX_HEALTH
      this.updateStatus()
    }
  }

  isAlive(): boolean {
    return this.status !== TeamMemberStatus.Deceased
  }

  rest(): string | void {
    if (this.isAlive()) {
      const recovery = Math.floor(Math.random() * 20) + 10

      this.heal(recovery)
      return `${this.name} recovers ${recovery} health.`
    }
  }

  getInfo(): string[] {
    return [
      this.name,
      this.role,
      this.health.toString(),
      this.status,
      ...Object.entries(this.skills).map(
        ([skill, level]) => `${skill}: ${level}`
      ),
    ]
  }
}
