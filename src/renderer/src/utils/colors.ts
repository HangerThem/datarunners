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
