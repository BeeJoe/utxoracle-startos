import { T } from '@start9labs/start-sdk'
import { configMain, writeNormalizedConfig } from './fileModels/config.main'
import { i18n } from './i18n'
import { sdk } from './sdk'
import { bitcoinMountpoint, uiPort } from './utils'

type BitcoinCoreManifest = T.SDKManifest & {
  id: 'bitcoind'
  volumes: ['main']
}

export const main = sdk.setupMain(async ({ effects }) => {
  console.info(i18n('Starting UTXOracle'))

  await writeNormalizedConfig(effects)
  await configMain.read().const(effects)

  const mounts = sdk.Mounts.of()
    .mountVolume({
      volumeId: 'main',
      subpath: null,
      mountpoint: '/root',
      readonly: false,
    })
    .mountDependency<BitcoinCoreManifest>({
      dependencyId: 'bitcoind',
      volumeId: 'main',
      subpath: null,
      mountpoint: bitcoinMountpoint,
      readonly: true,
    })

  const subcontainer = await sdk.SubContainer.of(
    effects,
    { imageId: 'main' },
    mounts,
    'utxoracle-sub',
  )

  return sdk.Daemons.of(effects)
    .addDaemon('primary', {
      subcontainer,
      exec: {
        command: sdk.useEntrypoint(),
        runAsInit: true,
      },
      ready: {
        display: i18n('Web Interface'),
        fn: () =>
          sdk.healthCheck.checkPortListening(effects, uiPort, {
            successMessage: i18n('The web interface is ready'),
            errorMessage: i18n('The web interface is not ready'),
          }),
        gracePeriod: 30_000,
      },
      requires: [],
    })
    .addHealthCheck('complete', {
      ready: {
        display: i18n('UTXOracle Completion'),
        fn: async () => {
          const res = await subcontainer.exec(
            ['/usr/local/bin/check-complete.sh', 'complete'],
            {},
            10_000,
          )
          const message =
            String(res.stdout || res.stderr).trim() ||
            i18n('UTXOracle has not completed successfully')

          if (res.exitCode === 0) {
            return {
              result: 'success',
              message: i18n('UTXOracle completed successfully'),
            }
          }
          if (res.exitCode === 60) {
            return {
              result: 'loading',
              message: message || i18n('UTXOracle is still running'),
            }
          }
          return { result: 'failure', message }
        },
        trigger: sdk.trigger.statusTrigger(30_000, {
          starting: 5_000,
          loading: 30_000,
          failure: 30_000,
        }),
      },
      requires: ['primary'],
    })
})
