import { TeamMember, TeamMemberStatus } from "./teamMember.js"
import { Inventory, InventoryEntry } from "./inventory/inventory.js"
import { createItem, ItemName } from "./items/itemFactory.js"
import { ResourceKey, Resources } from "./inventory/resources.js"
import { Event, EventChoice } from "./event/event.js"
import { Chiptune } from "./music/chiptune.js"

export interface GameState {
  resources: Resources
  teamMembers: TeamMember[]
  distanceTraveled: number
  totalDistance: number
  currentLocation: string
  destination: string
  gameDate: Date
  dayCounter: number
  weather: string
  gameActive: boolean
  currentEvent: any
  awaitingChoice: boolean
  choiceOptions: EventChoice[]
  inventory: Inventory
}

export class Game {
  gameState: GameState
  chiptune: Chiptune
  locations: { name: string; distance: number; description: string }[]
  events: Event[]
  weatherConditions: string[]

  constructor() {
    this.gameState = {
      resources: new Resources(1000, 50, 25),

      teamMembers: [
        new TeamMember(
          "ZERO",
          "Netrunner",
          {
            Combat: 4,
          },
          this
        ),
        new TeamMember(
          "SPARK",
          "Techie",
          {
            Engineering: 4,
          },
          this
        ),
        new TeamMember(
          "GHOST",
          "Runner",
          {
            Stealth: 4,
          },
          this
        ),
        new TeamMember(
          "DOC",
          "Medtech",
          {
            Medical: 4,
          },
          this
        ),
      ],

      distanceTraveled: 0,
      totalDistance: 2000,
      currentLocation: "Seattle Ruins",
      destination: "Neo-Tokyo Data Haven",

      gameDate: new Date(2077, 2, 20),
      dayCounter: 0,
      weather: "Clear Skies",

      gameActive: true,
      currentEvent: null,
      awaitingChoice: false,
      choiceOptions: [],

      inventory: new Inventory(this),
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
      new Event(
        "Corporate Patrol",
        "A corporate security drone spots your team. Its sensors sweep the area, looking for unauthorized data traffickers.",
        [
          {
            text: "Attempt to hack the drone",
            outcome: "hack",
            risk: 0,
            cost: { items: { HackerTool: 1 }, resources: { credits: 50 } },
            reward: () => {
              this.gameState.resources.earn({ data: 20 })
              this.addText(
                "You successfully hack the drone and extract valuable data chips.",
                "gameText",
                "success-text"
              )
            },
          },
          {
            text: "Use jammers to create interference",
            outcome: "jam",
            risk: 0.3,
            cost: { items: { Jammer: 1 } },
          },
          {
            text: "Hide and wait for it to pass",
            outcome: "hide",
            risk: 0.2,
            reward: () => {
              this.gameState.dayCounter += 1
              this.gameState.gameDate.setDate(
                this.gameState.gameDate.getDate() + 1
              )
            },
          },
        ],
        this
      ),
      new Event(
        "Wandering Merchant",
        "A nomadic trader approaches your camp, offering cyberware and supplies. Their prices seem reasonable, but can you trust them?",
        [
          {
            text: "Buy medical supplies (100 credits)",
            outcome: "buy",
            cost: { resources: { credits: 100 } },
            reward: () => {
              this.gameState.inventory.addItem(
                createItem("Medkit", this.gameState),
                2
              )
              this.addText(
                "You purchase 2 Medkits.",
                "gameText",
                "success-text"
              )
            },
          },
          {
            text: "Purchase energy cells (50 credits each)",
            outcome: "buy",
            cost: { resources: { credits: 50 } },
            reward: () => {
              this.gameState.inventory.addItem(
                createItem("SmallEnergyCell", this.gameState),
                5
              )
              this.addText(
                "You purchase 5 Small Energy Cells.",
                "gameText",
                "success-text"
              )
            },
          },
          {
            text: "Sell excess data chips (20 credits each)",
            outcome: "buy",
            cost: { resources: { data: 10 } },
            reward: () => {
              this.gameState.resources.earn({ credits: 200 })
              this.addText(
                "You sell 10 data chips for 200 credits.",
                "gameText",
                "success-text"
              )
            },
          },
          { text: "Decline trading", outcome: "cancel" },
        ],
        this
      ),
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

    this.chiptune = new Chiptune()

    this.init()
  }

  async init() {
    await this.bootSequence()
    this.mainMenu()
  }

  async bootSequence() {
    await new Promise((resolve) => setTimeout(resolve, 500))

    const logo = await fetch("/data/logo.txt").then((res) => res.text())
    this.addText(logo, "gameText", "logo")

    await new Promise((resolve) => setTimeout(resolve, 1000))

    this.addText("BOOTING TERMINAL INTERFACE v2.1...", "gameText")
    await new Promise((resolve) => setTimeout(resolve, 1000))

    this.addText("INITIALIZING CYBERPUNK OREGON TRAIL...", "gameText")
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const loadingSteps = [
      "Loading resources...",
      "Establishing secure connection...",
      "Calibrating neural interfaces...",
      "Syncing team data...",
      "Finalizing setup...",
    ]

    for (const step of loadingSteps) {
      this.addText(step, "gameText")
      await new Promise((resolve) =>
        setTimeout(resolve, 400 + Math.random() * 800)
      )
    }

    this.addText("SYSTEM READY.", "gameText", "success-text")
  }

  mainMenu() {
    this.addText("", "gameText")
    this.addText("=== MAIN MENU ===", "gameText", "menu-header")
    this.addText("1. Start New Game", "gameText", "menu-option")
    this.addText("2. Load Game", "gameText", "menu-option")
    this.addText("3. Help", "gameText", "menu-option")
    this.addText("4. Exit", "gameText", "menu-option")
    this.addText("", "gameText")
    this.addText("Enter choice (1-4):", "gameText")

    this.gameState.awaitingChoice = true
    this.gameState.choiceOptions = [
      { text: "Start New Game", outcome: "new_game" },
      { text: "Load Game", outcome: "load_menu" },
      { text: "Help", outcome: "help" },
      { text: "Exit", outcome: "exit" },
    ]

    this.setupCommandInput()
    this.unlockInput()
  }

  async displayIntro() {
    this.lockInput()

    const introNarrative = [
      "In the year 2077, data is the most valuable currency.",
      "Mega-corporations rule the world, and information is power.",
      "You are a team of elite data runners, hired to transport sensitive information across the dangerous wastelands between Seattle and Neo-Tokyo.",
      "",
      "Your mission: Deliver the encrypted data chip to the Neo-Tokyo Data Haven, a sanctuary for free information.",
      "",
      "The journey will be perilous. Corporate patrols, rogue AIs, and environmental hazards stand between you and your goal.",
      "",
      "Manage your resources, make tough decisions, and keep your team alive. The fate of the digital revolution depends on you.",
      "",
      "Type HELP for a list of commands.",
      "",
    ]

    // this.typeText(introNarrative.join("\n"), "gameText", "", this.unlockInput)
    this.addText(introNarrative.join("\n"), "gameText", "")
    this.unlockInput()
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

  unlockInput() {
    const input = document.getElementById("commandInput") as HTMLInputElement
    input.disabled = false
    input.focus()
  }

  lockInput() {
    const input = document.getElementById("commandInput") as HTMLInputElement
    input.disabled = true
  }

  processCommand(command: string) {
    if (command.trim() === "") return

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
      case "TEAM":
        this.displayTable(
          ["Name", "Role", "Health", "Status", "Skills"],
          this.gameState.teamMembers.map((m) => m.getInfo()),
          "gameText"
        )
        break
      case "INVENTORY":
        this.gameState.inventory.showInventory()
        break
      case "USE":
        this.gameState.inventory.itemSelect()
        break
      case "SAVE":
        this.saveGame()
        break
      case "LOAD":
        this.loadMenu()
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
    if (!this.gameState.resources.canAfford({ energy: 5 })) {
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

    this.gameState.resources.pay({ energy: 5 })
    this.gameState.dayCounter += 1
    this.gameState.gameDate.setDate(this.gameState.gameDate.getDate() + 1)

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
    this.gameState.gameDate.setDate(this.gameState.gameDate.getDate() + 1)

    const energyCellsText =
      this.gameState.resources.energy + 3 === 50
        ? "Energy cells fully recharged."
        : this.gameState.resources.energy + 3 > 50
        ? "Energy cells are already at maximum capacity."
        : "Energy cells recharged by 3."

    this.gameState.resources.earn({ energy: 3 })

    let recoveryText = ["> REST", "", "Your team takes time to recover:"]

    this.gameState.teamMembers.forEach((member: TeamMember) => {
      const res = member.rest()

      res && recoveryText.push(res)
    })

    if (recoveryText.length === 3) {
      recoveryText.push("All team members are already at full health.")
    }

    recoveryText.push("", energyCellsText)

    this.addText(recoveryText.join("\n"), "gameText")

    if (Math.random() < 0.3) {
      this.addText("During your rest:", "gameText")
      this.triggerRandomEvent()
    }

    this.updateStatusDisplay()
  }

  showStatus() {
    this.displayTable(
      ["Resource", "Amount"],
      Object.entries(this.gameState.resources).map(([key, value]) => [
        key.charAt(0).toUpperCase() + key.slice(1),
        value.toString(),
      ]),
      "gameText"
    )
    this.addText(
      `Distance Traveled: ${this.gameState.distanceTraveled} / ${this.gameState.totalDistance} km`,
      "gameText"
    )
    this.addText(
      `Current Location: ${this.gameState.currentLocation}`,
      "gameText"
    )
    this.addText(`Destination: ${this.gameState.destination}`, "gameText")
    this.addText(
      `Current Date: ${this.gameState.gameDate.toDateString()}`,
      "gameText"
    )
    this.addText(`Day: ${this.gameState.dayCounter}`, "gameText")
    this.addText(`Weather: ${this.gameState.weather}`, "gameText")
  }

  triggerRandomEvent() {
    this.events[Math.floor(Math.random() * this.events.length)].present()
  }

  async processChoice(choiceInput: string) {
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

    console.log("Processing choice:", choice)

    if (choice.isPossible === false) {
      this.addText(
        "You don't have the required resources to perform that action.",
        "gameText",
        "error-text"
      )
      this.addText("", "gameText")
      this.gameState.choiceOptions.forEach((c: EventChoice, idx: number) => {
        if (!c.isPossible) {
          this.addText(
            `${idx + 1}. ${c.text} (Insufficient resources)`,
            "gameText",
            "menu-option disabled-text"
          )
        } else {
          this.addText(`${idx + 1}. ${c.text}`, "gameText", "menu-option")
        }
      })
      return
    }

    switch (choice.outcome) {
      case "new_game":
        await this.chiptune.initOnGesture()
        this.chiptune.setMasterVolume(0.2)
        this.chiptune.playTrack("travel")
        document.getElementById("statusPanel")!.style.display = "block"
        this.updateStatusDisplay()
        this.clearText("gameText")
        this.populateStartingInventory()
        this.displayIntro()
        this.gameState.awaitingChoice = false
        return
      case "load_menu":
        this.loadMenu()
        this.gameState.awaitingChoice = false
        return
      case "load_save":
        this.loadGame(choice.itemRef)
        this.gameState.awaitingChoice = false
      case "help":
        this.showHelp()
        return
      case "use_item":
        this.gameState.inventory.useItem(choice.itemRef!)
        this.gameState.awaitingChoice = false
        return
      case "cancel":
        this.addText("Action cancelled.", "gameText")
        this.updateStatusDisplay()
        this.gameState.awaitingChoice = false
        return
      case "exit":
        this.addText("Exiting game. Goodbye!", "gameText")
        this.lockInput()
        return
    }

    this.addText(`> ${choice.text}`, "gameText")

    this.gameState.choiceOptions = []

    if (choice.cost) {
      if (choice.cost.items) {
        Object.entries(choice.cost.items).forEach(([itemName, qty]) => {
          this.gameState.inventory.removeItem(itemName as ItemName, qty!)
          this.addText(`Used ${qty} x ${itemName}`, "gameText", "info-text")
        })
      }
      if (choice.cost.resources) {
        Object.entries(choice.cost.resources).forEach(([resName, qty]) => {
          this.gameState.resources.pay({ [resName]: qty! })
          this.addText(`Spent ${qty} ${resName}`, "gameText", "info-text")
        })
      }
    }

    if (choice.risk) {
      if (Math.random() > choice.risk) {
        this.addText("Success!", "gameText", "success-text")
        choice.reward && choice.reward()
      } else {
        this.addText("Failed!", "gameText", "error-text")
        this.applyPenalty(choice.risk || 0.5)
      }
    } else {
      choice.reward && choice.reward()
    }

    this.gameState.currentEvent = null
    this.gameState.awaitingChoice = false

    this.chiptune.playTrack("travel")

    this.updateStatusDisplay()
  }

  populateStartingInventory() {
    this.gameState.inventory.addItem(createItem("Bandage", this.gameState), 5)
    this.gameState.inventory.addItem(
      createItem("HackerTool", this.gameState),
      1
    )
    this.gameState.inventory.addItem(
      createItem("SmallEnergyCell", this.gameState),
      2
    )
  }

  restoreEnergy(amount: number): boolean {
    if (this.gameState.resources.energy >= 50) {
      this.addText("Energy cells are already at maximum capacity.", "gameText")
      return false
    } else if (this.gameState.resources.energy + amount > 50) {
      this.addText("Energy cells fully recharged.", "gameText", "success-text")
    } else {
      this.addText(
        `Restored ${amount} energy points.`,
        "gameText",
        "success-text"
      )
    }

    this.gameState.resources.earn({ energy: amount })
    this.updateStatusDisplay()
    return true
  }

  applyPenalty(riskLevel: number) {
    const damage = Math.floor(riskLevel * 30) + Math.floor(Math.random() * 20)

    const randomMember =
      this.gameState.teamMembers[
        Math.floor(Math.random() * this.gameState.teamMembers.length)
      ]

    randomMember.receiveDamage(damage)
  }

  checkGameOver() {
    const allDeceased = this.gameState.teamMembers.every(
      (member) => member.status === TeamMemberStatus.Deceased
    )
    if (allDeceased) {
      this.gameOver("All team members have perished. Your journey ends here.")
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
    dataChipsElement.textContent = this.gameState.resources.data.toString()
    energyCellsElement.textContent = this.gameState.resources.energy.toString()

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
    gameDateElement.textContent =
      this.gameState.gameDate.getDate().toString() +
      "/" +
      (this.gameState.gameDate.getMonth() + 1).toString() +
      "/" +
      this.gameState.gameDate.getFullYear().toString()
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
      `Data chips collected: ${this.gameState.resources.data}`,
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
    const currentSaves = localStorage.getItem("cyberpunkOregonTrail")
    localStorage.setItem(
      "cyberpunkOregonTrail",
      JSON.stringify([
        ...(currentSaves ? JSON.parse(currentSaves) : []),
        {
          id: Date.now(),
          timestamp: new Date().toISOString(),
          gameState: this.gameState,
        },
      ])
    )
    this.addText("Game saved successfully.", "gameText", "success-text")
  }

  loadMenu() {
    const savedGames = localStorage.getItem("cyberpunkOregonTrail")
    if (savedGames) {
      const saves = JSON.parse(savedGames)
      if (saves.length === 0) {
        this.addText("No saved games available.", "gameText", "error-text")
        return
      }

      this.addText("Select a save to load:", "gameText")
      saves.forEach((save: any, index: number) => {
        this.addText(
          `${index + 1}. Save from ${new Date(
            save.timestamp
          ).toLocaleString()}`,
          "gameText",
          "menu-option"
        )
      })

      this.gameState.awaitingChoice = true
      this.gameState.choiceOptions = saves.map((save: any) => ({
        text: `Load save from ${new Date(save.timestamp).toLocaleString()}`,
        outcome: "load_save",
        itemRef: save,
      }))
    } else {
      this.addText("No saved games available.", "gameText", "error-text")
    }
  }

  loadGame(save: any) {
    if (!save) {
      this.addText("Invalid save selected.", "gameText", "error-text")
      return
    }

    this.gameState = save.gameState
    this.clearText("gameText")
    this.addText(
      `Loaded save from ${new Date(save.timestamp).toLocaleString()}`,
      "gameText",
      "success-text"
    )
    document.getElementById("statusPanel")!.style.display = "block"
    this.updateStatusDisplay()
  }

  quickLoad() {
    const savedGames = localStorage.getItem("cyberpunkOregonTrail")
    if (savedGames) {
      const saves = JSON.parse(savedGames)
      if (saves.length > 0) {
        const latestSave = saves[saves.length - 1]
        this.gameState = latestSave.gameState
        this.addText(
          `Loaded latest save from ${latestSave.timestamp}`,
          "gameText"
        )
        this.updateStatusDisplay()
        return
      }
    }
    this.addText("No saved games available.", "gameText", "error-text")
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

  typeText(
    text: string,
    elementId: string,
    className = "",
    onComplete?: () => void
  ) {
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

    if (onComplete) {
      setTimeout(onComplete, text.length * 30 + 500)
    }
  }

  displayTable(headers: string[], rows: string[][], elementId: string) {
    const element = document.getElementById(elementId) as HTMLElement
    const table = document.createElement("table")
    table.className = "data-table"

    const thead = document.createElement("thead")
    const headerRow = document.createElement("tr")
    headers.forEach((header) => {
      const th = document.createElement("th")
      th.textContent = header
      headerRow.appendChild(th)
    })
    thead.appendChild(headerRow)
    table.appendChild(thead)

    const tbody = document.createElement("tbody")
    rows.forEach((row) => {
      const tr = document.createElement("tr")
      row.forEach((cell) => {
        const td = document.createElement("td")
        td.textContent = cell
        tr.appendChild(td)
      })
      tbody.appendChild(tr)
    })
    table.appendChild(tbody)

    element.appendChild(table)

    const scrollContainer = element.parentElement || element
    scrollContainer.scrollTop = scrollContainer.scrollHeight
  }

  clearText(elementId: string) {
    const element = document.getElementById(elementId) as HTMLElement
    element.innerHTML = ""
  }
}

let game: Game

document.addEventListener("DOMContentLoaded", () => {
  if (!game) {
    game = new Game()
  }
})

export function getGameInstance(): Game {
  if (!game) {
    game = new Game()
  }
  return game
}
