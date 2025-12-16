export function rgb(r: number, g: number, b: number): number {
  return ((r & 255) << 16) | ((g & 255) << 8) | (b & 255)
}

export function rgba(r: number, g: number, b: number, a: number): number {
  return (((a & 255) << 24) | ((r & 255) << 16) | ((g & 255) << 8) | (b & 255)) >>> 0
}

export function hexColor(hex: string): number {
  hex = hex.replace(/^#/, '')

  if (hex.length === 6) hex += 'ff'

  const value = parseInt(hex, 16)

  const r = (value >>> 24) & 255
  const g = (value >>> 16) & 255
  const b = (value >>> 8) & 255
  const a = value & 255

  return rgba(r, g, b, a)
}

export function hsl(h: number, s: number, l: number): number {
  s /= 100
  l /= 100

  const k = (n: number): number => (n + h / 30) % 12
  const a = s * Math.min(l, 1 - l)

  const f = (n: number): number => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)))

  return rgb(Math.round(255 * f(0)), Math.round(255 * f(8)), Math.round(255 * f(4)))
}

export function colorToCss(color: number): string {
  const a = (color >>> 24) & 255
  const r = (color >>> 16) & 255
  const g = (color >>> 8) & 255
  const b = color & 255

  const alpha = a / 255

  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

export function blendColors(colorA: number, colorB: number, t: number): number {
  const aA = (colorA >>> 24) & 255
  const rA = (colorA >>> 16) & 255
  const gA = (colorA >>> 8) & 255
  const bA = colorA & 255

  const aB = (colorB >>> 24) & 255
  const rB = (colorB >>> 16) & 255
  const gB = (colorB >>> 8) & 255
  const bB = colorB & 255

  const a = Math.round(aA + (aB - aA) * t)
  const r = Math.round(rA + (rB - rA) * t)
  const g = Math.round(gA + (gB - gA) * t)
  const b = Math.round(bA + (bB - bA) * t)

  return rgba(r, g, b, a)
}

export function setAlpha(color: number, alpha: number): number {
  const r = (color >>> 16) & 255
  const g = (color >>> 8) & 255
  const b = color & 255

  return rgba(r, g, b, alpha)
}

export function getAlpha(color: number): number {
  return (color >>> 24) & 255
}

export function validateColor(color: number): boolean {
  return Number.isInteger(color) && color >= 0 && color <= 0xffffffff
}
