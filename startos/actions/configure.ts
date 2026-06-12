import { i18n } from '../i18n'
import { configMain, normalizeConfig } from '../fileModels/config.main'
import { sdk } from '../sdk'

const { InputSpec, Value } = sdk

const inputSpec = InputSpec.of({
  argument: Value.text({
    name: i18n('Argument'),
    description: i18n(
      'Leave blank for recent block mode, enter rb for recent block mode, y for yesterday, or a UTC date as YYYY/MM/DD.',
    ),
    required: false,
    default: null,
    placeholder: 'YYYY/MM/DD',
    patterns: [
      {
        regex: '^(|rb|y|[0-9]{4}/[0-9]{2}/[0-9]{2})$',
        description: i18n('Use blank, rb, y, or YYYY/MM/DD.'),
      },
    ],
  }),
})

export const configure = sdk.Action.withInput(
  'configure',
  {
    name: i18n('Configure'),
    description: i18n('Set the UTXOracle runtime argument'),
    warning: null,
    allowedStatuses: 'any',
    group: null,
    visibility: 'enabled',
  },
  inputSpec,
  async ({ effects }) => {
    const current = await configMain.read().once()
    return { argument: current?.argument ?? null }
  },
  async ({ effects, input }) => {
    const current = await configMain.read().once()
    await configMain.write(effects, {
      ...normalizeConfig(current),
      argument: input.argument?.trim() || null,
    })
  },
)
