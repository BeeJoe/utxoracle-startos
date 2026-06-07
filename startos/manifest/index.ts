import { setupManifest } from '@start9labs/start-sdk'
import { bitcoindDescription, long, short } from './i18n'

export const manifest = setupManifest({
  id: 'utxoracle',
  title: 'UTXOracle',
  license: 'MIT',
  packageRepo: 'https://github.com/citizenanalog/utxoracle-startos',
  upstreamRepo: 'https://utxo.live/oracle/UTXOracle.py',
  marketingUrl: 'https://utxo.live/',
  donationUrl:
    'https://primal.net/p/nprofile1qqsd39l0ekt3lrj74cyvs6ma5ehcnvcwwcdy4p4vg8vswsjazkmrplspa5mvm',
  description: { short, long },
  volumes: ['main'],
  images: {
    main: {
      source: { dockerBuild: {} },
      arch: ['x86_64', 'aarch64'],
    },
  },
  alerts: {
    install: null,
    update: null,
    uninstall: null,
    restore: null,
    start: null,
    stop: null,
  },
  dependencies: {
    bitcoind: {
      description: bitcoindDescription,
      optional: false,
      metadata: {
        title: 'Bitcoin Core',
        icon: 'https://raw.githubusercontent.com/Start9Labs/bitcoin-core-startos/31.x/icon.svg',
      },
    },
  },
})
