class TerminalEffects {
  glitchActive: boolean
  digitalRainActive: boolean
  scanlineIntensity: number

  constructor() {
    this.glitchActive = false
    this.digitalRainActive = false
    this.scanlineIntensity = 0.03
    this.init()
  }

  init() {
    this.setupDigitalRain()
    this.setupGlitchEffects()
    this.setupTerminalFlicker()
    this.setupKeyboardEffects()
    this.startAmbientEffects()
  }

  setupDigitalRain() {
    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")
    const digitalRain = document.getElementById("digitalRain")

    if (!digitalRain || !ctx) return

    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
    digitalRain.appendChild(canvas)

    const chars =
      "01アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン"
    const fontSize = 10
    const columns = canvas.width / fontSize
    const drops: number[] = []

    for (let i = 0; i < columns; i++) {
      drops[i] = (Math.random() * canvas.height) / fontSize
    }

    const drawDigitalRain = () => {
      ctx.fillStyle = "rgba(0, 0, 0, 0.05)"
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      ctx.fillStyle = "#007700"
      ctx.font = fontSize + "px Courier New"

      for (let i = 0; i < drops.length; i++) {
        const text = chars[Math.floor(Math.random() * chars.length)]
        ctx.fillText(text, i * fontSize, drops[i] * fontSize)

        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
          drops[i] = 0
        }
        drops[i]++
      }
    }

    setInterval(drawDigitalRain, 100)

    window.addEventListener("resize", () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    })
  }

  setupGlitchEffects() {
    setInterval(() => {
      if (Math.random() < 0.1) {
        this.triggerGlitch()
      }
    }, 3000)
  }

  triggerGlitch(duration = 200) {
    if (this.glitchActive) return

    this.glitchActive = true
    const terminal = document.querySelector(".terminal-container")

    if (!terminal) return

    terminal.classList.add("glitch-effect")

    this.createGlitchOverlay()

    setTimeout(() => {
      terminal.classList.remove("glitch-effect")
      this.removeGlitchOverlay()
      this.glitchActive = false
    }, duration)
  }

  createGlitchOverlay() {
    const overlay = document.createElement("div")
    overlay.className = "glitch-overlay"
    overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: repeating-linear-gradient(
                0deg,
                transparent,
                transparent 2px,
                rgba(255, 0, 255, 0.1) 2px,
                rgba(255, 0, 255, 0.1) 4px
            );
            pointer-events: none;
            z-index: 999;
            mix-blend-mode: difference;
        `

    document.body.appendChild(overlay)

    let offset = 0
    const animateOverlay = () => {
      overlay.style.backgroundPosition = `0 ${offset}px`
      offset += 2
      if (offset < 20) {
        requestAnimationFrame(animateOverlay)
      }
    }
    animateOverlay()
  }

  removeGlitchOverlay() {
    const overlay = document.querySelector(".glitch-overlay")
    if (overlay) {
      overlay.remove()
    }
  }

  setupTerminalFlicker() {
    setInterval(() => {
      if (Math.random() < 0.05) {
        const crtEffect = document.querySelector(".crt-effect") as HTMLElement

        if (!crtEffect) return

        crtEffect.style.opacity = "0.8"
        setTimeout(() => {
          crtEffect.style.opacity = "1"
        }, 50)
      }
    }, 2000)
  }

  setupKeyboardEffects() {
    const input = document.getElementById("commandInput")

    if (!input) return

    input.addEventListener("keydown", (e) => {
      this.createKeystrokeEffect()

      if (e.key === "Enter" && Math.random() < 0.1) {
        setTimeout(() => this.triggerGlitch(100), 100)
      }
    })

    input.addEventListener("focus", () => {
      this.enhanceTerminalGlow()
    })

    input.addEventListener("blur", () => {
      this.reduceTerminalGlow()
    })
  }

  createKeystrokeEffect() {
    const input = document.getElementById("commandInput") as HTMLInputElement

    if (!input) return

    const rect = input.getBoundingClientRect()

    const flash = document.createElement("div")
    flash.style.cssText = `
            position: fixed;
            left: ${rect.left + (input.selectionStart ?? 0) * 8}px;
            top: ${rect.top}px;
            width: 2px;
            height: 20px;
            background: #00FF00;
            pointer-events: none;
            z-index: 1001;
            animation: keystroke-flash 0.1s ease-out forwards;
        `

    if (!document.getElementById("keystroke-animation")) {
      const style = document.createElement("style")
      style.id = "keystroke-animation"
      style.textContent = `
                @keyframes keystroke-flash {
                    0% { opacity: 1; transform: scaleY(1); }
                    100% { opacity: 0; transform: scaleY(0); }
                }
            `
      document.head.appendChild(style)
    }

    document.body.appendChild(flash)
    setTimeout(() => flash.remove(), 100)
  }

  enhanceTerminalGlow() {
    const terminal = document.querySelector(
      ".terminal-container"
    ) as HTMLElement

    if (!terminal) return

    terminal.style.boxShadow = `
            inset 0 0 30px rgba(0, 255, 0, 0.2),
            0 0 40px rgba(0, 255, 0, 0.4),
            0 0 60px rgba(0, 255, 0, 0.2)
        `
  }

  reduceTerminalGlow() {
    const terminal = document.querySelector(
      ".terminal-container"
    ) as HTMLElement

    if (!terminal) return

    terminal.style.boxShadow = `
            inset 0 0 20px rgba(0, 255, 0, 0.1),
            0 0 20px rgba(0, 255, 0, 0.2)
        `
  }

  startAmbientEffects() {
    setInterval(() => {
      if (Math.random() < 0.3) {
        this.scanlineIntensity = 0.02 + Math.random() * 0.03
        this.updateScanlines()
      }
    }, 5000)

    setInterval(() => {
      if (Math.random() < 0.05) {
        this.powerSurgeEffect()
      }
    }, 8000)
  }

  updateScanlines() {
    const crtEffect = document.querySelector(".crt-effect") as HTMLElement

    if (!crtEffect) return

    crtEffect.style.background = `repeating-linear-gradient(
            0deg,
            transparent,
            transparent 2px,
            rgba(0, 255, 0, ${this.scanlineIntensity}) 2px,
            rgba(0, 255, 0, ${this.scanlineIntensity}) 4px
        )`
  }

  powerSurgeEffect() {
    const terminal = document.querySelector(
      ".terminal-container"
    ) as HTMLElement

    if (!terminal) return

    const originalBorder = terminal.style.borderColor

    terminal.style.borderColor = "#00FFFF"
    terminal.style.boxShadow = `
            inset 0 0 50px rgba(0, 255, 255, 0.3),
            0 0 100px rgba(0, 255, 255, 0.5)
        `

    setTimeout(() => {
      terminal.style.borderColor = originalBorder
      this.reduceTerminalGlow()
    }, 200)

    this.createStaticInterference()
  }

  createStaticInterference() {
    const staticOverlay = document.createElement("div")
    staticOverlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: repeating-linear-gradient(
                0deg,
                transparent,
                transparent 1px,
                rgba(0, 255, 255, 0.1) 1px,
                rgba(0, 255, 255, 0.1) 2px
            );
            pointer-events: none;
            z-index: 998;
            animation: static-flicker 0.1s linear infinite;
            opacity: 0.3;
        `

    if (!document.getElementById("static-animation")) {
      const style = document.createElement("style")
      style.id = "static-animation"
      style.textContent = `
                @keyframes static-flicker {
                    0% { transform: translateY(0px) scaleX(1); }
                    25% { transform: translateY(-1px) scaleX(1.01); }
                    50% { transform: translateY(1px) scaleX(0.99); }
                    75% { transform: translateY(-1px) scaleX(1.01); }
                    100% { transform: translateY(0px) scaleX(1); }
                }
            `
      document.head.appendChild(style)
    }

    document.body.appendChild(staticOverlay)

    setTimeout(() => {
      staticOverlay.remove()
    }, 500)
  }

  createTextGlitch(element: HTMLElement, duration = 1000) {
    const originalText = element.textContent
    const chars =
      "01アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン"

    let glitchInterval = setInterval(() => {
      let glitchedText = ""
      for (let i = 0; i < originalText.length; i++) {
        if (Math.random() < 0.3) {
          glitchedText += chars[Math.floor(Math.random() * chars.length)]
        } else {
          glitchedText += originalText[i]
        }
      }
      element.textContent = glitchedText
    }, 50)

    setTimeout(() => {
      clearInterval(glitchInterval)
      element.textContent = originalText
    }, duration)
  }

  typeWithEffects(element: HTMLElement, text: string, speed = 50) {
    element.textContent = ""
    element.style.borderRight = "2px solid #00FF00"

    let i = 0
    const typeInterval = setInterval(() => {
      if (i < text.length) {
        if (Math.random() < 0.05) {
          element.textContent += String.fromCharCode(0x2588)
          setTimeout(() => {
            element.textContent = element.textContent.slice(0, -1) + text[i]
          }, 100)
        } else {
          element.textContent += text[i]
        }

        i++

        if (Math.random() < 0.02) {
          this.triggerGlitch(50)
        }
      } else {
        clearInterval(typeInterval)
        element.style.borderRight = "none"
      }
    }, speed)
  }

  animateProgressBar(
    element: HTMLElement,
    targetWidth: number,
    duration = 1000
  ) {
    const startWidth = parseFloat(element.style.width) || 0
    const startTime = Date.now()

    const animate = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)

      const easeProgress = 1 - Math.pow(1 - progress, 3)
      const currentWidth =
        startWidth + (targetWidth - startWidth) * easeProgress

      element.style.width = `${currentWidth}%`

      const glowIntensity = Math.sin(progress * Math.PI) * 20
      element.style.boxShadow = `0 0 ${glowIntensity}px #00FF00`

      if (progress < 1) {
        requestAnimationFrame(animate)
      }
    }

    animate()
  }

  enhanceCursor() {
    const cursor = document.querySelector(".prompt") as HTMLElement

    if (!cursor) return

    setInterval(() => {
      const opacity = cursor.style.opacity === "0" ? "1" : "0"
      cursor.style.opacity = opacity

      if (Math.random() < 0.1) {
        cursor.style.textShadow = `0 0 ${Math.random() * 20}px #00FF00`
        setTimeout(() => {
          cursor.style.textShadow = "0 0 10px #00FF00"
        }, 100)
      }
    }, 500)
  }

  updateWeatherEffects(weather: string) {
    const terminal = document.querySelector(
      ".terminal-container"
    ) as HTMLElement

    if (!terminal) return

    switch (weather) {
      case "Acid Rain":
        terminal.style.filter = "hue-rotate(120deg) brightness(0.8)"
        break
      case "Electromagnetic Storm":
        this.triggerGlitch(2000)
        terminal.style.filter = "contrast(1.2) saturate(1.5)"
        break
      case "Clear Skies":
        terminal.style.filter = "brightness(1.1)"
        break
      case "Toxic Fog":
        terminal.style.filter = "hue-rotate(60deg) blur(0.75px)"
        break
      case "Solar Flare":
        terminal.style.filter = "brightness(2.5) saturate(1.3)"
        break
      case "Data Storm":
        terminal.style.filter = "hue-rotate(240deg) contrast(1.3)"
        break
      case "Corporate Overcast":
        terminal.style.filter = "grayscale(0.75) brightness(0.9)"
        break
      default:
        terminal.style.filter = "none"
    }
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const terminalEffects = new TerminalEffects()

  terminalEffects.enhanceCursor()

  setTimeout(() => {
    terminalEffects.triggerGlitch(300)
  }, 2000)

  setInterval(() => {
    if (Math.random() < 0.1) {
      terminalEffects.powerSurgeEffect()
    }
  }, 15000)

  window.terminalEffects = terminalEffects
})
