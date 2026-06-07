import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '0.9.6:4',
  releaseNotes: {
    en_US:
      'Adds a Bitcoin Core RPC fallback when raw block files do not contain every target block.',
  },
  migrations: {
    up: async ({ effects }) => {},
    down: IMPOSSIBLE,
  },
})
