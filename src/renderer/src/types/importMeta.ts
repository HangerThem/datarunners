export interface ExpandedImportMeta extends ImportMeta {
  env: {
    DEV: boolean
  }
  hot: boolean
}
