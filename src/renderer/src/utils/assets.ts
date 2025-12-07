interface ImportMetaWithEnv extends ImportMeta {
  env: {
    DEV: boolean
  }
}

export function asset(path: string): string {
  return (import.meta as ImportMetaWithEnv).env.DEV ? `/${path}` : `game:///${path}`
}
