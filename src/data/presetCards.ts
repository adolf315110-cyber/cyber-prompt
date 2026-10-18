import type { Card } from '../types'
import { SEC_AUDIT_CARDS } from './preset/secAudit'
import { PENTEST_CARDS } from './preset/pentest'
import { CODING_CARDS } from './preset/coding'
import { OUTPUT_CARDS } from './preset/output'
import { GENERAL_CARDS } from './preset/general'

/** 预置卡库（只读，随代码走）。用户自定义卡在 localStorage，不在此处。 */
export const PRESET_CARDS: Card[] = [
  ...SEC_AUDIT_CARDS,
  ...PENTEST_CARDS,
  ...CODING_CARDS,
  ...OUTPUT_CARDS,
  ...GENERAL_CARDS,
]
