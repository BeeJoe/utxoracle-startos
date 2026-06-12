import { sdk } from './sdk'

export const setDependencies = sdk.setupDependencies(async ({ effects }) => ({
  bitcoind: {
    kind: 'running',
    versionRange: '>=31.0:0 <32.0.0:0',
    healthChecks: ['sync-progress'],
  },
}))
