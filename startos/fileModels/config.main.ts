import { FileHelper, z } from '@start9labs/start-sdk'
import { sdk } from '../sdk'
import {
  bitcoinBlocksDir,
  bitcoinRpcCookieFile,
  bitcoinRpcHost,
  bitcoinRpcPort,
} from '../utils'

const configShape = z.object({
  network: z.string().catch('bitcoin'),
  rpccookiefile: z.string().catch(bitcoinRpcCookieFile),
  'bitcoin-rpcconnect': z.string().catch(bitcoinRpcHost),
  'bitcoin-rpcport': z.string().catch(bitcoinRpcPort),
  blocksdir: z.string().catch(bitcoinBlocksDir),
  'bind-addr': z.string().catch('0.0.0.0:9735'),
  argument: z.string().nullable().catch(null),
  alias: z.string().catch('UTXOracle'),
})

export type ConfigMain = z.infer<typeof configShape>

export const defaultConfig = {
  network: 'bitcoin',
  rpccookiefile: bitcoinRpcCookieFile,
  'bitcoin-rpcconnect': bitcoinRpcHost,
  'bitcoin-rpcport': bitcoinRpcPort,
  blocksdir: bitcoinBlocksDir,
  'bind-addr': '0.0.0.0:9735',
  argument: null,
  alias: 'UTXOracle',
} satisfies ConfigMain

const parseConfig = (raw: string): unknown => {
  const parsed: Record<string, string | null> = {}
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#') || !trimmed.includes('=')) {
      continue
    }

    const [key, ...rest] = trimmed.split('=')
    const value = rest.join('=').trim().replace(/^"|"$/g, '')
    parsed[key.trim()] =
      key.trim() === 'argument' && value === '' ? null : value
  }
  return parsed
}

export const normalizeConfig = (config: ConfigMain | null): ConfigMain => ({
  ...defaultConfig,
  argument: config?.argument?.trim() || null,
})

export const renderConfig = (config: ConfigMain): string => {
  const normalized = normalizeConfig(config)
  return [
    `network=${normalized.network}`,
    `rpccookiefile=${normalized.rpccookiefile}`,
    `bitcoin-rpcconnect=${normalized['bitcoin-rpcconnect']}`,
    `bitcoin-rpcport=${normalized['bitcoin-rpcport']}`,
    `blocksdir=${normalized.blocksdir}`,
    `bind-addr=${normalized['bind-addr']}`,
    `argument=${normalized.argument ?? ''}`,
    `alias=${normalized.alias}`,
    '',
  ].join('\n')
}

export const configMain = FileHelper.raw(
  { base: sdk.volumes.main, subpath: 'config.main' },
  renderConfig,
  parseConfig,
  (data) => configShape.parse(data),
)

export const writeNormalizedConfig = async (
  effects: Parameters<typeof configMain.write>[0],
) => {
  const current = await configMain.read().once()
  await configMain.write(effects, normalizeConfig(current))
}
