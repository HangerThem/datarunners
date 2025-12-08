import { ExpandedImportMeta } from '../types/importMeta'

export function asset(path: string): string {
  return (import.meta as ExpandedImportMeta).env.DEV ? `/${path}` : `game:///${path}`
}
