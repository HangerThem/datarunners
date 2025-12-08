import { Dialog } from '../ecs/components/dialog'
import { ExtendedWorld } from '../ecs/world'

export function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const paragraphs = text.split('\n')
  const lines: string[] = []

  for (const paragraph of paragraphs) {
    const words = paragraph.split(' ').filter(Boolean)
    let line = ''

    for (const word of words) {
      const test = line ? line + ' ' + word : word

      if (ctx.measureText(test).width <= maxWidth) {
        line = test
      } else {
        if (line) lines.push(line)
        line = word
      }
    }

    if (line) lines.push(line)
    if (paragraph === '' && text.includes('\n')) lines.push('')
  }

  return lines
}

export function getTextLines(world: ExtendedWorld, textId: number): string[] {
  return world.assets.getAssetById<string[]>(textId)!
}

export function getCurrentLineText(world: ExtendedWorld, currentDialog: number): string {
  const textLines = getTextLines(world, Dialog.textId[currentDialog])
  return textLines[Dialog.currentLine[currentDialog]]
}
