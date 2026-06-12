export const DEFAULT_LANG = 'en_US'

const dict = {
  // actions/configure.ts
  Configure: 0,
  'Set the UTXOracle runtime argument': 1,
  Argument: 2,
  'Leave blank for recent block mode, enter rb for recent block mode, y for yesterday, or a UTC date as YYYY/MM/DD.': 3,
  'Use blank, rb, y, or YYYY/MM/DD.': 4,

  // interfaces.ts
  'Web UI': 5,
  'The UTXOracle web interface': 6,

  // main.ts
  'Starting UTXOracle': 7,
  'Web Interface': 8,
  'The web interface is ready': 9,
  'The web interface is not ready': 10,
  'UTXOracle Completion': 11,
  'UTXOracle completed successfully': 12,
  'UTXOracle is still running': 13,
  'UTXOracle has not completed successfully': 14,
} as const

/**
 * Plumbing. DO NOT EDIT.
 */
export type I18nKey = keyof typeof dict
export type LangDict = Record<(typeof dict)[I18nKey], string>
export default dict
