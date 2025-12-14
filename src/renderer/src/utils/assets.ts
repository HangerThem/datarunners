import { ExpandedImportMeta } from '../types/importMeta'

export function asset(path: string, type: 'image' | 'audio' | 'text' | 'font'): string {
  return (import.meta as ExpandedImportMeta).env.DEV
    ? `/assets/${type}/${path}`
    : `game:///assets/${type}/${path}`
}
