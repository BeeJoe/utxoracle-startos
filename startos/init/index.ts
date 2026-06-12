import { sdk } from '../sdk'
import { actions } from '../actions'
import { restoreInit } from '../backups'
import { setDependencies } from '../dependencies'
import { writeNormalizedConfig } from '../fileModels/config.main'
import { setInterfaces } from '../interfaces'
import { versionGraph } from '../versions'

const seedConfig = sdk.setupOnInit(async (effects) => {
  await writeNormalizedConfig(effects)
})

export const init = sdk.setupInit(
  restoreInit,
  versionGraph,
  setInterfaces,
  setDependencies,
  actions,
  seedConfig,
)

export const uninit = sdk.setupUninit(versionGraph)
