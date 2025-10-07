interface Resources {
  credits: number
  dataChips: number
  energyCells: number
}

interface TeamMember {
  name: string
  role: string
  health: number
  status: string
  skill: string
}

interface InventoryItem {
  name: string
  type: string
  amount: number
  description: string
  use?: (game: CyberpunkOregonTrail) => void
}

interface Inventory {
  [key: string]: InventoryItem
}

interface GameState {
  resources: Resources
  teamMembers: TeamMember[]
  distanceTraveled: number
  totalDistance: number
  currentLocation: string
  destination: string
  gameDate: string
  dayCounter: number
  weather: string
  gameActive: boolean
  currentEvent: any
  awaitingChoice: boolean
  choiceOptions: any[]
  inventory: Inventory
}

interface ChoiceOption {
  text: string
  outcome: string
  risk?: number
  cost?: { [key: string]: number }
  reward?: { [key: string]: number | boolean }
  itemRef?: InventoryItem
}

class CyberpunkOregonTrail {
  gameState: GameState
  locations: { name: string; distance: number; description: string }[]
  events: any[]
  weatherConditions: string[]

  constructor() {
    this.gameState = {
      resources: {
        credits: 1000,
        dataChips: 50,
        energyCells: 25,
      },

      teamMembers: [
        {
          name: "ZERO",
          role: "Netrunner",
          health: 100,
          status: "Healthy",
          skill: "Hacking",
        },
        {
          name: "SPARK",
          role: "Techie",
          health: 100,
          status: "Healthy",
          skill: "Engineering",
        },
        {
          name: "GHOST",
          role: "Runner",
          health: 100,
          status: "Healthy",
          skill: "Stealth",
        },
        {
          name: "DOC",
          role: "Medtech",
          health: 100,
          status: "Healthy",
          skill: "Medical",
        },
      ],

      distanceTraveled: 0,
      totalDistance: 2000,
      currentLocation: "Seattle Ruins",
      destination: "Neo-Tokyo Data Haven",

      gameDate: "2077.03.15",
      dayCounter: 0,
      weather: "Corporate Overcast",

      gameActive: true,
      currentEvent: null,
      awaitingChoice: false,
      choiceOptions: [],

      inventory: {
        medkit: {
          name: "Medkit",
          type: "consumable",
          amount: 3,
          description: "Heals 30 HP to one team member.",
          use: (game: CyberpunkOregonTrail) => game.healMember(30),
        },
        energyPack: {
          name: "Energy Pack",
          type: "consumable",
          amount: 2,
          description: "Restores 20 energy cells.",
          use: (game: CyberpunkOregonTrail) => game.restoreEnergy(20),
        },
        jammer: {
          name: "Signal Jammer",
          type: "equipment",
          amount: 2,
          description: "Used to avoid detection in certain encounters.",
        },
      },
    }

    this.locations = [
      {
        name: "Seattle Ruins",
        distance: 0,
        description: "The abandoned server farms outside the Seattle Metroplex",
      },
      {
        name: "Tacoma Wastes",
        distance: 200,
        description: "Industrial wasteland patrolled by corporate drones",
      },
      {
        name: "Olympus Checkpoint",
        distance: 400,
        description: "Corporate security checkpoint, expect heavy scrutiny",
      },
      {
        name: "Portland Underground",
        distance: 600,
        description: "Hacker underground network and black market",
      },
      {
        name: "Salem Dead Zone",
        distance: 800,
        description: "Electromagnetic storm area, all electronics at risk",
      },
      {
        name: "Eugene Safe Haven",
        distance: 1000,
        description: "Independent settlement free from corporate control",
      },
      {
        name: "Cascade Mountains",
        distance: 1200,
        description: "Treacherous mountain passes and harsh weather",
      },
      {
        name: "Boise Trade Post",
        distance: 1400,
        description: "Neutral trading post between major powers",
      },
      {
        name: "Salt Lake Citadel",
        distance: 1600,
        description: "Theocratic city-state with strict entry requirements",
      },
      {
        name: "Denver Free Zone",
        distance: 1800,
        description: "Anarchist territory with no central authority",
      },
      {
        name: "Neo-Tokyo Data Haven",
        distance: 2000,
        description: "Your destination - the last free data haven",
      },
    ]

    this.events = [
      {
        type: "encounter",
        title: "Corporate Patrol",
        description:
          "A corporate security drone spots your team. Its sensors sweep the area, looking for unauthorized data traffickers.",
        choices: [
          {
            text: "Attempt to hack the drone",
            outcome: "hack",
            risk: 0.7,
            reward: { dataChips: 20, energy: -5 },
          },
          {
            text: "Use jammers to create interference",
            outcome: "jam",
            risk: 0.3,
            cost: { jammers: 1 },
            reward: { safety: true },
          },
          {
            text: "Hide and wait for it to pass",
            outcome: "hide",
            risk: 0.2,
            reward: { time: 1 },
          },
        ],
      },
      {
        type: "discovery",
        title: "Abandoned Server Farm",
        description:
          "You discover a partially collapsed data center. Ancient servers hum with residual power, possibly containing valuable pre-war data.",
        choices: [
          {
            text: "Search for salvageable data chips",
            outcome: "search",
            risk: 0.4,
            reward: { dataChips: 30, energy: -10 },
          },
          {
            text: "Strip equipment for energy cells",
            outcome: "strip",
            risk: 0.2,
            reward: { energyCells: 15, time: 1 },
          },
          {
            text: "Avoid the unstable structure",
            outcome: "avoid",
            risk: 0.0,
            reward: {},
          },
        ],
      },
      {
        type: "trade",
        title: "Wandering Merchant",
        description:
          "A nomadic trader approaches your camp, offering cyberware and supplies. Their prices seem reasonable, but can you trust them?",
        choices: [
          {
            text: "Buy medical supplies (100 credits)",
            outcome: "buy_med",
            cost: { credits: 100 },
            reward: { medkit: 2 },
          },
          {
            text: "Purchase energy cells (50 credits each)",
            outcome: "buy_energy",
            cost: { credits: 50 },
            reward: { energyCells: 5 },
          },
          {
            text: "Sell excess data chips (20 credits each)",
            outcome: "sell_data",
            cost: { dataChips: 10 },
            reward: { credits: 200 },
          },
          { text: "Decline trading", outcome: "decline", reward: {} },
        ],
      },
      {
        type: "hazard",
        title: "Electromagnetic Storm",
        description:
          "Warning sirens blare as an EM storm approaches. Your cyberware crackles with static electricity. All electronic equipment is at risk.",
        choices: [
          {
            text: "Shut down all systems and wait",
            outcome: "shutdown",
            risk: 0.1,
            reward: { time: 2, energy: -5 },
          },
          {
            text: "Attempt to shield equipment",
            outcome: "shield",
            risk: 0.5,
            reward: { energy: -15 },
          },
          {
            text: "Push through the storm",
            outcome: "push",
            risk: 0.8,
            reward: { distance: 50, damage: 100 },
          },
        ],
      },
      {
        type: "story",
        title: "Digital Ghost",
        description:
          "A fragmented AI consciousness contacts your team through the net. It claims to have vital information about safe routes ahead.",
        choices: [
          {
            text: "Trust the AI and accept its data",
            outcome: "trust_ai",
            risk: 0.6,
            reward: { dataChips: 15, distance: 30 },
          },
          {
            text: "Negotiate for better information",
            outcome: "negotiate",
            risk: 0.4,
            reward: { dataChips: 25 },
          },
          {
            text: "Refuse contact - AI can't be trusted",
            outcome: "refuse",
            risk: 0.0,
            reward: { safety: true },
          },
        ],
      },
    ]

    this.weatherConditions = [
      "Acid Rain",
      "Electromagnetic Storm",
      "Toxic Fog",
      "Clear Skies",
      "Nuclear Winter",
      "Data Storm",
      "Corporate Overcast",
      "Anarchy Weather",
      "Solar Flare",
    ]

    this.init()
  }

  init() {
    this.displayIntro()
    this.updateStatusDisplay()
    this.setupCommandInput()
  }

  displayIntro() {
    const introText = [
      "SYSTEM BOOT SEQUENCE INITIATED...",
      "CYBERPUNK OREGON TRAIL v2.1",
      "",
      "The year is 2077. The world has changed.",
      "Corporations rule the wastelands between cities.",
      "Data is the new gold. Hackers are the new pioneers.",
      "",
      "Your team must travel 2000 kilometers from the Seattle Ruins",
      "to the Neo-Tokyo Data Haven - the last free network on Earth.",
      "",
      "Commands: TRAVEL, REST, STATUS, INVENTORY, HELP",
      "",
      "Your journey begins now...",
      "",
    ]

    this.typeText(introText.join("\n"), "gameText")
  }

  setupCommandInput() {
    const input = document.getElementById("commandInput") as HTMLInputElement

    input.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        this.processCommand(input.value.trim().toUpperCase())
        input.value = ""
      }
    })

    input.focus()
  }

  processCommand(command: string) {
    if (this.gameState.awaitingChoice) {
      this.processChoice(command)
      return
    }

    switch (command) {
      case "HELP":
        this.showHelp()
        break
      case "TRAVEL":
        this.travel()
        break
      case "REST":
        this.rest()
        break
      case "STATUS":
        this.showStatus()
        break
      case "INVENTORY":
        this.showInventory()
        break
      case "USE":
        this.itemSelect()
        break
      case "SAVE":
        this.saveGame()
        break
      case "LOAD":
        this.loadGame()
        break
      default:
        this.addText(`> ${command}`, "gameText")
        this.addText(
          "Unknown command. Type HELP for available commands.",
          "gameText",
          "error-text"
        )
    }
  }

  showHelp() {
    const helpText = [
      "AVAILABLE COMMANDS:",
      "",
      "TRAVEL - Continue your journey to Neo-Tokyo",
      "REST - Recover team health and energy",
      "STATUS - Display detailed team and journey status",
      "INVENTORY - Show inventory and supplies",
      "USE - Use an item from your inventory",
      "HELP - Display this help message",
      "SAVE - Save your current game progress",
      "LOAD - Load a previously saved game",
      "",
      "During events, respond with the number of your choice (1-4)",
    ]

    this.addText(helpText.join("\n"), "gameText")
  }

  travel() {
    if (this.gameState.resources.energyCells < 5) {
      this.addText(
        "Insufficient energy cells to travel safely.",
        "gameText",
        "error-text"
      )
      this.addText(
        "You need at least 5 energy cells to power your equipment.",
        "gameText"
      )
      return
    }

    this.gameState.resources.energyCells -= 5
    this.gameState.dayCounter += 1

    const travelDistance = Math.floor(Math.random() * 100) + 50
    this.gameState.distanceTraveled = Math.min(
      this.gameState.distanceTraveled + travelDistance,
      this.gameState.totalDistance
    )

    this.updateCurrentLocation()

    if (Math.random() < 0.3) {
      this.gameState.weather =
        this.weatherConditions[
          Math.floor(Math.random() * this.weatherConditions.length)
        ]
    }

    this.addText(`> TRAVEL`, "gameText")
    this.addText(
      `Your team travels ${travelDistance} kilometers through the ${this.gameState.weather.toLowerCase()}.`,
      "gameText"
    )
    this.addText("Energy cells consumed: 5", "gameText")

    if (Math.random() < 0.6) {
      this.triggerRandomEvent()
    } else {
      this.addText("The journey continues without incident.", "gameText")
    }

    if (this.gameState.distanceTraveled >= this.gameState.totalDistance) {
      this.gameWin()
    }

    this.updateStatusDisplay()
  }

  rest() {
    this.gameState.dayCounter += 1

    this.gameState.resources.energyCells = Math.min(
      this.gameState.resources.energyCells + 3,
      50
    )

    let recoveryText = ["> REST", "Your team takes time to recover:"]

    this.gameState.teamMembers.forEach((member: TeamMember) => {
      if (member.health < 100) {
        const recovery = Math.min(
          Math.floor(Math.random() * 20) + 10,
          100 - member.health
        )
        member.health = Math.min(member.health + recovery, 100)
        if (member.health === 100) {
          member.status = "Healthy"
        }
        recoveryText.push(`${member.name} recovers ${recovery} health.`)
      }
    })

    recoveryText.push("Energy cells recharged: +3")

    this.addText(recoveryText.join("\n"), "gameText")

    if (Math.random() < 0.3) {
      this.addText("During your rest:", "gameText")
      this.triggerRandomEvent()
    }

    this.updateStatusDisplay()
  }

  showStatus() {
    const statusText = [
      "=== TEAM STATUS ===",
      "",
      `Journey: ${this.gameState.distanceTraveled}/${this.gameState.totalDistance} km`,
      `Location: ${this.gameState.currentLocation}`,
      `Weather: ${this.gameState.weather}`,
      `Day: ${this.gameState.dayCounter}`,
      "",
      "Team Members:",
    ]

    this.gameState.teamMembers.forEach((member) => {
      statusText.push(
        `${member.name} (${member.role}): ${member.health}% health - ${member.status}`
      )
    })

    this.addText(statusText.join("\n"), "gameText")
  }

  showInventory() {
    const items = Object.values(this.gameState.inventory)
    const resourceLines = Object.entries(this.gameState.resources)
      .map(([k, v]) => `${k}: ${v}`)
      .join("\n")

    const itemLines = items
      .map(
        (item, i) =>
          `${i + 1}. ${item.name} x${item.amount} — ${item.description}`
      )
      .join("\n")

    const text = [
      "=== INVENTORY ===",
      resourceLines,
      "",
      "=== ITEMS ===",
      itemLines.length ? itemLines : "No items.",
    ]

    this.addText(text.join("\n"), "gameText")
  }

  itemSelect() {
    const usableItems = Object.values(this.gameState.inventory).filter(
      (item) => item.amount > 0 && item.type === "consumable"
    )

    if (usableItems.length === 0) {
      this.addText("No usable items in inventory.", "gameText", "error-text")
      return
    }

    this.addText("Select an item to use:", "gameText")
    usableItems.forEach((item, index) => {
      this.addText(
        `${index + 1}. ${item.name} (${item.amount}) - ${item.description}`,
        "gameText",
        "menu-option"
      )
    })

    this.gameState.awaitingChoice = true
    this.gameState.choiceOptions = usableItems.map((item) => ({
      text: item.name,
      outcome: "use_item",
      itemRef: item,
    }))
  }

  triggerRandomEvent() {
    const event = this.events[Math.floor(Math.random() * this.events.length)]
    this.gameState.currentEvent = event
    this.gameState.awaitingChoice = true

    this.addText(``, "gameText")
    this.addText(`*** ${event.title} ***`, "gameText", "warning-text")
    this.addText(event.description, "gameText")
    this.addText("", "gameText")
    this.addText("What do you do?", "gameText")

    event.choices.forEach((choice: ChoiceOption, index: number) => {
      this.addText(`${index + 1}. ${choice.text}`, "gameText", "menu-option")
    })

    this.gameState.choiceOptions = event.choices
  }

  processChoice(choiceInput: string) {
    const choiceIndex = parseInt(choiceInput) - 1
    if (
      isNaN(choiceIndex) ||
      choiceIndex < 0 ||
      choiceIndex >= this.gameState.choiceOptions.length
    ) {
      this.addText("Invalid choice. Try again.", "gameText", "error-text")
      return
    }

    const choice = this.gameState.choiceOptions[choiceIndex]
    this.gameState.awaitingChoice = false

    if (choice.outcome === "use_item") {
      this.useItem(choice.itemRef)
      return
    }

    this.gameState.choiceOptions = []

    const success = Math.random() > choice.risk

    if (success) {
      this.addText("Success!", "gameText", "success-text")
      this.applyRewards(choice.reward)
    } else {
      this.addText("Failed!", "gameText", "error-text")
      this.applyPenalty(choice.risk || 0.5)
    }

    this.updateStatusDisplay()
  }

  useItem(item: InventoryItem) {
    if (item.amount <= 0) {
      this.addText(`No ${item.name}s left!`, "gameText", "error-text")
      return
    }

    if (!item.use) {
      this.addText(`${item.name} cannot be used directly.`, "gameText")
      return
    }

    item.use(this)
    item.amount -= 1
    this.addText(`Used one ${item.name}.`, "gameText", "success-text")
    this.updateStatusDisplay()
  }

  healMember(amount: number) {
    const injuredMembers = this.gameState.teamMembers.filter(
      (m) => m.health < 100
    )
    if (injuredMembers.length === 0) {
      this.addText("All team members are already at full health.", "gameText")
      return
    }

    const memberToHeal = injuredMembers.reduce((prev, curr) =>
      prev.health < curr.health ? prev : curr
    )
    memberToHeal.health = Math.min(100, memberToHeal.health + amount)
    memberToHeal.status = "Healthy"
    this.addText(
      `${memberToHeal.name} healed by ${amount} points.`,
      "gameText",
      "success-text"
    )
  }

  restoreEnergy(amount: number) {
    this.gameState.resources.energyCells = Math.min(
      50,
      this.gameState.resources.energyCells + amount
    )
    this.addText(
      `Energy cells restored by ${amount}.`,
      "gameText",
      "success-text"
    )
  }

  applyRewards(rewards: { [key: string]: number | boolean }) {
    if (!rewards) return

    Object.keys(rewards).forEach((key) => {
      switch (key) {
        case "credits":
          if (typeof rewards[key] === "number") {
            this.gameState.resources.credits += rewards[key] as number
            this.addText(`+${rewards[key]} credits`, "gameText", "success-text")
          }
          break
        case "dataChips":
          if (typeof rewards[key] === "number") {
            this.gameState.resources.dataChips += rewards[key]
            this.addText(
              `+${rewards[key]} data chips`,
              "gameText",
              "success-text"
            )
          }
          break
        case "energyCells":
          if (typeof rewards[key] === "number") {
            this.gameState.resources.energyCells += rewards[key]
            this.addText(
              `+${rewards[key]} energy cells`,
              "gameText",
              "success-text"
            )
          }
          break
        case "distance":
          if (typeof rewards[key] === "number") {
            this.gameState.distanceTraveled += rewards[key]
            this.addText(
              `Advanced ${rewards[key]} km`,
              "gameText",
              "success-text"
            )
          }
          break
        case "energy":
          if (typeof rewards[key] === "number") {
            this.gameState.resources.energyCells += rewards[key]

            if (rewards[key] > 0) {
              this.addText(
                `+${rewards[key]} energy cells`,
                "gameText",
                "success-text"
              )
            } else {
              this.addText(
                `${rewards[key]} energy cells`,
                "gameText",
                "error-text"
              )
            }
          }
          break
      }
    })
  }

  applyPenalty(riskLevel: number) {
    const randomMember =
      this.gameState.teamMembers[
        Math.floor(Math.random() * this.gameState.teamMembers.length)
      ]

    const damage = Math.floor(riskLevel * 30) + Math.floor(Math.random() * 20)
    randomMember.health = Math.max(0, randomMember.health - damage)

    this.addText(
      `${randomMember.name} takes ${damage} damage!`,
      "gameText",
      "error-text"
    )

    if (randomMember.health <= 0) {
      randomMember.status = "Critical"
      this.addText(
        `${randomMember.name} is in critical condition!`,
        "gameText",
        "error-text"
      )
    } else if (randomMember.health < 50) {
      randomMember.status = "Injured"
    }

    if (randomMember.health <= 0) {
      this.addText(
        `${randomMember.name} has died from their injuries...`,
        "gameText",
        "error-text"
      )
      this.gameState.teamMembers = this.gameState.teamMembers.filter(
        (m) => m !== randomMember
      )

      if (this.gameState.teamMembers.length === 0) {
        this.gameOver("All team members have perished. Your journey ends here.")
      }
    }
  }

  updateCurrentLocation() {
    for (let i = this.locations.length - 1; i >= 0; i--) {
      if (this.gameState.distanceTraveled >= this.locations[i].distance) {
        this.gameState.currentLocation = this.locations[i].name
        break
      }
    }
  }

  updateStatusDisplay() {
    const creditsElement = document.getElementById("credits") as HTMLElement
    const dataChipsElement = document.getElementById("dataChips") as HTMLElement
    const energyCellsElement = document.getElementById(
      "energyCells"
    ) as HTMLElement

    creditsElement.textContent = this.gameState.resources.credits.toString()
    dataChipsElement.textContent = this.gameState.resources.dataChips.toString()
    energyCellsElement.textContent =
      this.gameState.resources.energyCells.toString()

    const teamContainer = document.getElementById("teamMembers") as HTMLElement
    teamContainer.innerHTML = ""

    this.gameState.teamMembers.forEach((member) => {
      const memberDiv = document.createElement("div")
      memberDiv.className = `team-member ${member.status.toLowerCase()}`
      memberDiv.innerHTML = `
                <div class="member-name">${member.name}</div>
                <div class="member-status">${member.role} - ${member.health}% - ${member.status}</div>
            `
      teamContainer.appendChild(memberDiv)
    })

    const distanceTraveledElement = document.getElementById(
      "distanceTraveled"
    ) as HTMLElement
    const totalDistanceElement = document.getElementById(
      "totalDistance"
    ) as HTMLElement
    const currentLocationElement = document.getElementById(
      "currentLocation"
    ) as HTMLElement
    const progressFillElement = document.getElementById(
      "progressFill"
    ) as HTMLElement
    const gameDateElement = document.getElementById("gameDate") as HTMLElement
    const weatherElement = document.getElementById("weather") as HTMLElement

    distanceTraveledElement.textContent =
      this.gameState.distanceTraveled.toString()
    totalDistanceElement.textContent = this.gameState.totalDistance.toString()
    currentLocationElement.textContent = this.gameState.currentLocation
    gameDateElement.textContent = this.gameState.gameDate
    weatherElement.textContent = this.gameState.weather

    const progressPercent =
      (this.gameState.distanceTraveled / this.gameState.totalDistance) * 100
    progressFillElement.style.width = `${progressPercent}%`

    if (window.terminalEffects) {
      window.terminalEffects.updateWeatherEffects(this.gameState.weather)
    }
  }

  gameWin() {
    this.gameState.gameActive = false
    const winText = [
      "",
      "*** JOURNEY COMPLETE ***",
      "",
      "Congratulations! Your team has reached the Neo-Tokyo Data Haven.",
      "Against all odds, you've survived the 2000-kilometer journey",
      "through the corporate wastelands and digital nightmares.",
      "",
      "The data you carry is safe. The revolution can begin.",
      "",
      `Final Stats:`,
      `Days taken: ${this.gameState.dayCounter}`,
      `Team members surviving: ${this.gameState.teamMembers.length}`,
      `Credits remaining: ${this.gameState.resources.credits}`,
      `Data chips collected: ${this.gameState.resources.dataChips}`,
      "",
      "You have won the game. The future is yours to shape.",
      "",
      "Thank you for playing Cyberpunk Oregon Trail.",
    ]

    this.typeText(winText.join("\n"), "gameText")
  }

  gameOver(reason: string) {
    this.gameState.gameActive = false
    const gameOverText = [
      "",
      "*** MISSION FAILED ***",
      "",
      reason,
      "",
      "Your journey ends in the wastelands between Seattle and Neo-Tokyo.",
      "The data you carried is lost forever.",
      "",
      `Final journey: ${this.gameState.distanceTraveled}/${this.gameState.totalDistance} km`,
      `Days survived: ${this.gameState.dayCounter}`,
      "",
      "The corporations win again.",
      "",
      "Thank you for playing Cyberpunk Oregon Trail.",
      "Try again? The revolution still needs heroes.",
    ]

    this.typeText(gameOverText.join("\n"), "gameText")
  }

  saveGame() {
    localStorage.setItem("cyberpunkOregonTrail", JSON.stringify(this.gameState))
    this.addText("Game saved successfully.", "gameText", "success-text")
  }

  loadGame() {
    const savedGame = localStorage.getItem("cyberpunkOregonTrail")
    if (savedGame) {
      this.gameState = JSON.parse(savedGame)
      this.updateStatusDisplay()
      this.addText("Game loaded successfully.", "gameText", "success-text")
    } else {
      this.addText("No saved game found.", "gameText", "error-text")
    }
  }

  addText(text: string, elementId: string, className = "") {
    const element = document.getElementById(elementId) as HTMLElement
    const textDiv = document.createElement("div")
    textDiv.className = `game-text ${className}`
    textDiv.textContent = text
    element.appendChild(textDiv)

    const scrollContainer = element.parentElement || element
    try {
      scrollContainer.scrollTop = scrollContainer.scrollHeight
    } catch (e) {
      textDiv.scrollIntoView({ behavior: "auto", block: "end" })
    }
  }

  typeText(text: string, elementId: string, className = "") {
    const element = document.getElementById(elementId) as HTMLElement
    const textDiv = document.createElement("div")
    textDiv.className = `game-text ${className}`
    element.appendChild(textDiv)

    let i = 0
    const typeInterval = setInterval(() => {
      if (i < text.length) {
        textDiv.textContent += text.charAt(i)
        i++
        const scrollContainer = element.parentElement || element
        scrollContainer.scrollTop = scrollContainer.scrollHeight
      } else {
        clearInterval(typeInterval)
      }
    }, 30)
  }
}

let game
document.addEventListener("DOMContentLoaded", () => {
  game = new CyberpunkOregonTrail()
})
